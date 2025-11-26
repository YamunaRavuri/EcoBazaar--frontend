import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, RouterModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']
})
export class ProductList implements OnInit, OnDestroy {
  products: Product[] = [];
  filtered: Product[] = [];
  searchText = '';
  ecoOnly = false;
  loading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();
  private search$ = new Subject<string>();

  constructor(private productService: ProductService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    this.productService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.products = Array.isArray(data) ? data : [];
        this.filtered = this.products;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load products';
        this.loading = false;
        this.toastr.error(this.error);
      }
    });
  }

  applyFilters(): void {
    const text = this.searchText.toLowerCase().trim();
    this.filtered = this.products.filter((p) => {
      const name = p.name?.toLowerCase() || '';
      const matchSearch = !text || name.includes(text);
      const matchEco = !this.ecoOnly || !!p.ecoCertified;
      return matchEco && matchSearch;
    });
  }

  onSearchChange(v: string): void {
    this.search$.next(v);
  }

  onEcoToggle(): void {
    this.applyFilters();
  }

  trackById(_: number, p: Product): number | string {
    return p.id ?? p.name ?? _;
  }
}
