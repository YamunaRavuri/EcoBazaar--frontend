import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

import { AuthGuard } from './guards/auth.guard';
import { Dashboard } from './pages/dashboard/dashboard';
import { RoleGuard } from './guards/role.guard';
import { ProductList } from './pages/product-list/product-list';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Cart } from './pages/cart/cart';
import { SellerProduct } from './pages/seller-product/seller-product';
import { SellerDashboard } from './pages/seller-dashboard/seller-dashboard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { 
    path: 'dashboard',
    component: Dashboard,
    canActivate: [AuthGuard] 
  },

  {
    path: 'products',
    component: ProductList,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_USER'] }
  },
  {
    path: 'products/:id',
    component: ProductDetail,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_USER'] }
  },
  { 
    path: 'cart',
    component: Cart,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_USER'] }
  },

  { 
    path: 'seller/product',
    component: SellerProduct,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_SELLER'] }
  },
  { 
    path: 'seller/dashboard',
    component: SellerDashboard,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_SELLER'] }
  },

  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin').then(m => m.Admin),
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },

  { path: '**', redirectTo: '' }
];