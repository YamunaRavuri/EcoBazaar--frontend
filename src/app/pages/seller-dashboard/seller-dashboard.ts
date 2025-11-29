import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Chart from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../../services/product';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './seller-dashboard.html'
})
export class SellerDashboard implements OnInit, OnDestroy {
  private productSvc = inject(ProductService);
  private reportSvc = inject(ReportService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  products: any[] = [];
  loading = true;
  error: string | null = null;
  stats = { total: 0, certified: 0, requested: 0, orders: 0, revenue: 0 };
  badge: string | null = null;

  @ViewChild('salesChart') salesChart!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  load() {
    this.loading = true;
    this.error = null;

    forkJoin([
      this.productSvc.getSellerProducts().pipe(catchError(() => of([]))),
      this.reportSvc.getSellerReport().pipe(catchError(() => of(null))),
      this.reportSvc.getSellerSales(14).pipe(catchError(() => of([])))
    ]).subscribe({
      next: ([productsRes, reportRes, salesRes]: any) => {
        this.products = productsRes || [];
        this.stats.total = this.products.length;
        this.stats.certified = this.products.filter((p: any) => p.ecoCertified).length;
        this.stats.requested = this.products.filter((p: any) => p.ecoRequested && !p.ecoCertified).length;
        this.stats.orders = Number(reportRes?.totalOrders ?? 0);
        this.stats.revenue = Number(reportRes?.totalRevenue ?? 0);
        this.badge = reportRes?.ecoSellerBadge ?? reportRes?.badge ?? 'New Seller';

        // Ensure the canvas exists, then render.
        this.loading = false;
        setTimeout(() => this.renderChart(salesRes || []), 0);
      },
      error: () => {
        this.error = 'Failed to load dashboard';
        this.loading = false;
      }
    });
  }

  /** Local YYYY-MM-DD (e.g., 2025-11-26) */
  private toLocalYMD(d: Date): string {
    return d.toLocaleDateString('en-CA');
  }

  renderChart(rawData: any[]) {
    if (!this.salesChart) return;
    const ctx = this.salesChart.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart?.destroy();

    // Map server data -> date string -> revenue
    const revenueMap = new Map<string, number>();
    rawData.forEach(item => {
      const raw = item.day || item.date || '';
      const dateStr = raw.includes('T') ? raw.split('T')[0] : raw; // handle possible ISO
      if (dateStr) revenueMap.set(dateStr, Number(item.revenue || 0));
    });

    const today = new Date();
    const labels: string[] = [];
    const values: number[] = [];

    // Build last 14 days (including today) using LOCAL date keys
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = this.toLocalYMD(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(dayName);
      values.push(revenueMap.get(dateKey) ?? 0);
    }

    const maxRevenue = Math.max(...values, 100);
    const suggestedMax = maxRevenue * 1.2;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: values.map(v => v > 0 ? '#10b981' : '#f3f4f6'),
          borderColor: '#10b981',
          borderWidth: 3,
          borderRadius: 12,
          borderSkipped: false,
          barThickness: 40,
          maxBarThickness: 55
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1800, easing: 'easeInOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#065f46',
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
              label: (ctx) => `Revenue: ₹${ctx.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax,
            ticks: {
              callback: (v) => '₹' + Number(v).toLocaleString()
            },
            grid: { color: '#f0fdf4' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  goAdd(): void {
    this.router.navigate(['/seller/product']);
  }

  edit(product: any): void {
    this.router.navigate(['/seller/product'], { state: { product } });
  }

  deleteProduct(id: number): void {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.productSvc.delete(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== id);
        this.stats.total = this.products.length;
        this.toastr.success('Product deleted successfully');
        this.load();
      },
      error: () => this.toastr.error('Failed to delete product')
    });
  }
}