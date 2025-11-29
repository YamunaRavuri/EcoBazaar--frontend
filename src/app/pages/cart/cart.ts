import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product';
import { Product } from '../../models/product';

interface EcoSwapSuggestion {
  name: string;
  productId: number;
  carbonSavings: number;
  cartItemId: number;
}

interface CartSummaryResponse {
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    productName?: string;
    price?: number;
  }>;
  totalPrice: number;
  totalCarbonUsed: number;
  totalCarbonSaved: number;
  ecoSuggestion?: string | null;
  swapSuggestion?: {
    cartItemIdToReplace: number;
    suggestedProductId: number;
    suggestedProductName: string;
    carbonSavingsPerUnit: number;
    quantity: number;
  } | null;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    productName: string;
    price: number;
    carbonImpact: number;
    imageUrl: string | null;
    ecoCertified: boolean;
  }> = [];

  totalPrice = 0;
  totalCarbon = 0;
  totalCarbonSaved = 0;
  suggestedEcoProduct: EcoSwapSuggestion | null = null;

  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.error = null;
    this.suggestedEcoProduct = null;

    this.cartService.getSummary().subscribe({
      next: (res: CartSummaryResponse) => {
        this.totalPrice = res.totalPrice ?? 0;
        this.totalCarbon = res.totalCarbonUsed ?? 0;
        this.totalCarbonSaved = res.totalCarbonSaved ?? 0;

        const items = res.items || [];
        if (items.length === 0) {
          this.items = [];
          this.loading = false;
          return;
        }

        const productCalls = items.map(item =>
          this.productService.getById(item.productId).pipe(
            catchError(() => of({
              id: item.productId,
              name: 'Unknown product',
              price: 0,
              carbonImpact: 0,
              imageUrl: null,
              ecoCertified: false
            } as Product))
          )
        );

        forkJoin(productCalls).subscribe({
          next: (products) => {
            this.items = items.map((item, idx) => {
              const p = products[idx];
              return {
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                productName: p.name || 'Unknown product',
                price: p.price ?? 0,
                carbonImpact: p.carbonImpact ?? 0,
                imageUrl: p.imageUrl ?? null,
                ecoCertified: !!p.ecoCertified
              };
            });

            if (res.swapSuggestion) {
              this.suggestedEcoProduct = {
                name: res.swapSuggestion.suggestedProductName,
                productId: res.swapSuggestion.suggestedProductId,
                carbonSavings: res.swapSuggestion.carbonSavingsPerUnit * res.swapSuggestion.quantity,
                cartItemId: res.swapSuggestion.cartItemIdToReplace
              };
            }

            this.loading = false;
          },
          error: () => {
            this.error = 'Failed to load cart products';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Failed to load cart';
        this.loading = false;
      }
    });
  }

  swapToEco(): void {
    if (!this.suggestedEcoProduct) return;

    this.toastr.info('Upgrading to eco-friendly choice...');

    this.cartService.swapToEco(
      this.suggestedEcoProduct.cartItemId,
      this.suggestedEcoProduct.productId
    ).subscribe({
      next: () => {
        this.toastr.success(`Switched to ${this.suggestedEcoProduct!.name}!`);
        this.loadCart();
      },
      error: () => this.toastr.error('Swap failed. Try again.')
    });
  }

  remove(id: number): void {
    if (!confirm('Remove this item?')) return;

    this.cartService.remove(id).subscribe({
      next: () => {
        this.toastr.success('Item removed');
        this.loadCart();
      },
      error: () => this.toastr.error('Failed to remove')
    });
  }

  checkout(): void {
    this.orderService.checkout().subscribe({
      next: () => {
        this.toastr.success('Order placed successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: () => this.toastr.error('Checkout failed')
    });
  }

  trackByItemId(_index: number, item: { id: number }): number {
    return item.id;
  }
}