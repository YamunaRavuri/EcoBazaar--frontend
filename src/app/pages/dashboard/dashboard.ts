import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserReportService } from '../../services/user-report';
import { catchError, finalize, of } from 'rxjs';
import Chart from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';

export interface UserReport {
  userId: number;
  userName: string;
  totalPurchase: number;
  totalSpent: number;
  totalCarbonUsed: number;
  totalCarbonSaved: number;
  ecoBadge: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit, OnDestroy {
  private reportSvc = inject(UserReportService);
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  name = localStorage.getItem('name') ?? 'User';
  role = localStorage.getItem('role')?.replace('ROLE_', '') ?? 'GUEST';

  loading = false;
  error: string | null = null;
  report: UserReport | null = null;

  hasPendingRequest = false;
  requesting = false;
  requestSuccess = false;

  hasPendingSellerRequest = false;
  sellerRequesting = false;
  sellerRequestSuccess = false;

  chartSaved!: Chart;
  chartUsed!: Chart;
  isDark = false;

  private themeObserver: MutationObserver | null = null;

  ngOnInit(): void {
    this.loadReport();

    this.isDark = document.documentElement.classList.contains('dark');
    this.themeObserver = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains('dark');
      if (dark !== this.isDark) {
        this.isDark = dark;
        this.updateChartTheme();
      }
    });
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    if (this.role === 'USER') {
      this.checkPendingAdminRequest();
      this.checkPendingSellerRequest();
    }
  }

  ngOnDestroy(): void {
    if (this.chartSaved) this.chartSaved.destroy();
    if (this.chartUsed) this.chartUsed.destroy();
    this.themeObserver?.disconnect();
  }

  loadReport() {
    this.loading = true;
    this.reportSvc.getReport()
      .pipe(
        catchError(err => {
          console.error(err);
          this.error = 'Failed to load eco report';
          this.toastr.error(this.error);
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((res: UserReport | null) => {
        if (!res) return;

        res.totalCarbonUsed = +res.totalCarbonUsed.toFixed(2);
        res.totalCarbonSaved = +res.totalCarbonSaved.toFixed(2);
        res.totalSpent = +res.totalSpent.toFixed(2);

        this.report = res;
        setTimeout(() => this.renderCharts(), 100);
      });
  }

  checkPendingAdminRequest() {
    this.http.get<boolean>('/api/admin-request/has-pending')
      .subscribe({
        next: (hasPending) => this.hasPendingRequest = hasPending,
        error: () => this.hasPendingRequest = false
      });
  }

  requestAdminAccess() {
    if (this.requesting || this.hasPendingRequest) return;

    this.requesting = true;
    this.requestSuccess = false;

    this.http.post<{ message: string }>('/api/admin-request/request', {}).subscribe({
      next: () => {
        this.hasPendingRequest = true;
        this.requestSuccess = true;
        this.requesting = false;
        this.toastr.success('Admin request sent. Await approval.');
      },
      error: (err) => {
        this.requesting = false;
        const msg = err?.error?.message || 'Failed to send admin request. Try again.';
        this.toastr.error(msg);
      }
    });
  }

  checkPendingSellerRequest() {
    this.http.get<boolean>('/api/seller-request/has-pending')
      .subscribe({
        next: (has) => this.hasPendingSellerRequest = has,
        error: () => this.hasPendingSellerRequest = false
      });
  }

  requestSellerAccess() {
    if (this.sellerRequesting || this.hasPendingSellerRequest) return;

    this.sellerRequesting = true;
    this.sellerRequestSuccess = false;

    this.http.post('/api/seller-request/request', {}).subscribe({
      next: () => {
        this.hasPendingSellerRequest = true;
        this.sellerRequestSuccess = true;
        this.sellerRequesting = false;
        this.toastr.success('Seller request sent. Await approval.');
      },
      error: (err) => {
        this.sellerRequesting = false;
        const msg = err?.error?.message || err?.error || 'Failed to send seller request. Try again.';
        this.toastr.error(msg);
      }
    });
  }

  renderCharts() {
    if (this.chartSaved) this.chartSaved.destroy();
    if (this.chartUsed) this.chartUsed.destroy();

    const savedCtx = document.getElementById('savedChart') as HTMLCanvasElement;
    const usedCtx = document.getElementById('usedChart') as HTMLCanvasElement;
    if (!savedCtx || !usedCtx || !this.report) return;

    const textColor = this.isDark ? '#d1d5db' : '#374151';
    const gridColor = this.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    const commonOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      },
      plugins: {
        legend: { labels: { color: textColor } }
      }
    };

    const savedData = this.report.totalCarbonSaved > 0
      ? [12, 18, 25, 22, 35, 40, 30]
      : [0, 0, 0, 0, 0, 0, 0];

    this.chartSaved = new Chart(savedCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Carbon Saved (kg)',
          data: savedData,
          borderColor: this.isDark ? '#34d399' : '#059669',
          backgroundColor: this.isDark ? '#34d39966' : '#10b98133',
          tension: 0.4,
          fill: true
        }]
      },
      options: commonOptions
    });

    const usedWeeklyData = [120, 160, 190, 170, 220, 260, 200];

    this.chartUsed = new Chart(usedCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Carbon Used (kg)',
          data: usedWeeklyData,
          borderColor: this.isDark ? '#f87171' : '#dc2626',
          backgroundColor: this.isDark ? '#ef444466' : '#dc262633',
          tension: 0.4,
          fill: true
        }]
      },
      options: commonOptions
    });
  }

  updateChartTheme() {
    const textColor = this.isDark ? '#d1d5db' : '#374151';
    const gridColor = this.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    [this.chartSaved, this.chartUsed].forEach((chart) => {
      if (!chart) return;

      if (chart.options.scales?.['x']?.ticks) chart.options.scales['x'].ticks.color = textColor;
      if (chart.options.scales?.['x']?.grid) chart.options.scales['x'].grid.color = gridColor;
      if (chart.options.scales?.['y']?.ticks) chart.options.scales['y'].ticks.color = textColor;
      if (chart.options.scales?.['y']?.grid) chart.options.scales['y'].grid.color = gridColor;
      if (chart.options.plugins?.legend?.labels) chart.options.plugins.legend.labels.color = textColor;

      chart.data.datasets.forEach((ds: any) => {
        if (ds.label?.includes('Saved')) {
          ds.borderColor = this.isDark ? '#34d399' : '#059669';
          ds.backgroundColor = this.isDark ? '#34d39966' : '#10b98133';
        } else {
          ds.borderColor = this.isDark ? '#f87171' : '#dc2626';
          ds.backgroundColor = this.isDark ? '#ef444466' : '#dc262633';
        }
      });

      chart.update();
    });
  }

  getBadgeColor(): string {
    if (!this.report || this.report.totalCarbonSaved <= 0) return 'from-gray-600 to-gray-500';

    const badge = this.report.ecoBadge || '';
    if (badge.includes('Eco Legend')) return 'from-yellow-500 to-amber-500';
    if (badge.includes('Green Hero')) return 'from-green-600 to-green-500';
    if (badge.includes('Conscious Shopper')) return 'from-blue-600 to-blue-500';
    if (badge.includes('Beginner')) return 'from-lime-600 to-lime-500';
    return 'from-gray-500 to-gray-400';
  }
}
