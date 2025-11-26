import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

interface PlatformReport {
  totalOrders: number;
  totalRevenue: number;
  totalCarbonUsed: number;
  totalCarbonSaved: number;
  netCarbon: number;
  totalUsers: number;
  totalProducts: number;
}

interface PendingProduct {
  id: number;
  name: string;
  price: number;
  carbonImpact: number;
  sellerName: string;
}

interface PendingSeller {
  id: number;
  name: string;
  email: string;
  productCount: number;
}

interface PendingAdminRequest {
  id: number;
  user: { id: number; name: string; email: string };
  requestedAt: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [DatePipe],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class Admin implements OnInit {
  private http = inject(HttpClient);
  private datePipe = inject(DatePipe);
  private toastr = inject(ToastrService);

  report: PlatformReport | null = null;
  pendingProducts: PendingProduct[] = [];
  pendingSellers: PendingSeller[] = [];
  pendingAdminRequests: PendingAdminRequest[] = [];

  loading = true;
  processing = new Set<number>();
  isDownloading = false;

  get today(): string {
    return this.datePipe.transform(new Date(), 'mediumDate') || '';
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;

    this.http.get<PlatformReport>('/api/admin/reports').subscribe({
      next: (r) => (this.report = r),
      error: () => this.toastr.error('Failed to load stats')
    });

    this.loadPendingProducts();
    this.loadPendingSellers();
    this.loadPendingAdminRequests();

    setTimeout(() => (this.loading = false), 600);
  }

  private loadPendingProducts(): void {
    this.http.get<PendingProduct[]>('/api/admin/pending-products').subscribe({
      next: (d) => (this.pendingProducts = d),
      error: () => this.toastr.error('Failed to load products')
    });
  }

  private loadPendingSellers(): void {
    this.http.get<PendingSeller[]>('/api/admin/pending-sellers').subscribe({
      next: (d) => (this.pendingSellers = d),
      error: () => this.toastr.error('Failed to load sellers')
    });
  }

  private loadPendingAdminRequests(): void {
    this.http.get<PendingAdminRequest[]>('/api/admin-request/pending').subscribe({
      next: (d) => (this.pendingAdminRequests = d),
      error: () => this.toastr.error('Failed to load admin requests')
    });
  }

  approveProduct(id: number): void {
    if (this.processing.has(id)) return;
    this.processing.add(id);

    this.http.put(`/api/admin/approveProduct/${id}`, {}).subscribe({
      next: () => {
        this.toastr.success('Eco Product Certified');
        this.loadAllData();
      },
      error: () => this.toastr.error('Failed'),
      complete: () => this.processing.delete(id)
    });
  }

  rejectProduct(id: number): void {
    if (this.processing.has(id)) return;
    if (!confirm('Reject this product? This will clear the eco-request.')) return;

    this.processing.add(id);
    this.http.put(`/api/admin/rejectProduct/${id}`, {}).subscribe({
      next: () => {
        this.toastr.success('Product request rejected');
        this.loadAllData();
      },
      error: () => this.toastr.error('Failed to reject'),
      complete: () => this.processing.delete(id)
    });
  }

  approveSeller(id: number): void {
    if (this.processing.has(id)) return;
    this.processing.add(id);

    this.http.put(`/api/admin/approveSeller/${id}`, {}).subscribe({
      next: () => {
        this.toastr.success('Seller Approved');
        this.loadAllData();
      },
      error: () => this.toastr.error('Failed'),
      complete: () => this.processing.delete(id)
    });
  }

  approveAdminRequest(id: number): void {
    if (this.processing.has(id)) return;
    this.processing.add(id);

    this.http.post(`/api/admin-request/approve/${id}`, {}).subscribe({
      next: () => {
        this.toastr.success('New Admin Added');
        this.loadAllData();
      },
      error: () => this.toastr.error('Failed'),
      complete: () => this.processing.delete(id)
    });
  }

  rejectAdminRequest(id: number): void {
    if (this.processing.has(id)) return;
    this.processing.add(id);

    this.http.post(`/api/admin-request/reject/${id}`, {}).subscribe({
      next: () => {
        this.toastr.success('Request Rejected');
        this.loadAllData();
      },
      error: () => this.toastr.error('Failed'),
      complete: () => this.processing.delete(id)
    });
  }

  downloadCsv(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toastr.error('Not authenticated');
      return;
    }
    if (this.isDownloading) return;

    this.isDownloading = true;
    this.http
      .get('/api/admin/reports/export', {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      })
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'orders-report.csv';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          this.toastr.success('CSV downloaded');
          this.isDownloading = false;
        },
        error: () => {
          this.toastr.error('Download failed');
          this.isDownloading = false;
        }
      });
  }
}
