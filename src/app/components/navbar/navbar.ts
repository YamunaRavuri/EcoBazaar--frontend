import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf } from '@angular/common';
import { Subject, filter, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    NgIf
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  cartCount = 0;

  ngOnInit(): void {
    this.updateCartCountIfNeeded();

    this.auth.loggedIn$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateCartCountIfNeeded();
    });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateCartCountIfNeeded();
      });
  }

  private updateCartCountIfNeeded(): void {
    if (this.auth.isUser() && this.auth.isLoggedIn()) {
      this.loadCartCount();
    } else {
      this.cartCount = 0;
    }
  }

  private loadCartCount(): void {
    this.cartService.getSummary().subscribe({
      next: (res: any) => {
        const items = res?.items;
        this.cartCount = Array.isArray(items) ? items.length : 0;
      },
      error: () => {
        this.cartCount = 0;
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.cartCount = 0;
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}