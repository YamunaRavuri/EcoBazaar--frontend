import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './cart.html',
})
export class Cart implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  items: any[] = [];
  totalPrice = 0;
  totalCarbon = 0;
  totalCarbonSaved = 0;
  ecoSuggestion: string | null = null;

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.error = null;

    this.cartService.getSummary().subscribe({
      next: (res: any) => {
        this.totalPrice = res.totalPrice ?? 0;
        this.totalCarbon = res.totalCarbonUsed ?? 0;
        this.totalCarbonSaved = res.totalCarbonSaved ?? 0;
        this.ecoSuggestion = res.ecoSuggestion ?? null;

        const items = res.items || [];
        if (!items.length) {
          this.items = [];
          this.loading = false;
          return;
        }

        const calls = items.map((item: any) =>
          this.productService.getById(item.productId).pipe(
            catchError(() =>
              of({
                id: item.productId,
                name: item.productName || 'Unknown product',
                price: item.price || 0,
                carbonImpact: item.carbonImpact || 0,
                imageUrl: item.imageUrl || null
              })
            )
          )
        );

        (forkJoin(calls) as any).subscribe({
          next: (productsAny: any) => {
            const products: any[] = productsAny as any[];
            this.items = items.map((it: any, idx: number) => {
              const p = products[idx] || {};
              return {
                ...it,
                productName: p.name || it.productName,
                price: p.price ?? it.price,
                carbonImpact: p.carbonImpact ?? it.carbonImpact,
                imageUrl: p.imageUrl ?? it.imageUrl
              };
            });
            this.loading = false;
          },
          error: () => {
            this.error = 'Failed to load cart products';
            this.items = items;
            this.loading = false;
            this.toastr.error(this.error);
          }
        });
      },
      error: () => {
        this.error = 'Failed to load cart';
        this.items = [];
        this.loading = false;
        this.toastr.error(this.error);
      }
    });
  }

  remove(id: number) {
    if (!confirm('Remove this item?')) return;
    this.cartService.remove(id).subscribe({
      next: () => {
        this.toastr.success('Item removed from cart');
        this.loadCart();
      },
      error: () => {
        this.toastr.error('Remove failed');
      }
    });
  }

  checkout() {
    this.orderService.checkout().subscribe({
      next: () => {
        this.toastr.success('Order placed successfully');
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        const status = err?.status ?? 'unknown';
        const serverMsg =
          (typeof err?.error === 'string' && err.error) ||
          err?.error?.message ||
          err?.message ||
          'Checkout failed';
        this.toastr.error(`${serverMsg} (status: ${status})`);
      }
    });
  }
}
