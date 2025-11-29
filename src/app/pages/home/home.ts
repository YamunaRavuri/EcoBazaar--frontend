import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  private auth = inject(AuthService);
  private router = inject(Router);
  loggedIn$ = this.auth.loggedIn$;

  goToDashboard() {
    const role = this.auth.getRole();
    if (!role) return this.router.navigateByUrl('/login');

    if (role === 'ROLE_ADMIN')  return this.router.navigateByUrl('/admin');
    if (role === 'ROLE_SELLER') return this.router.navigateByUrl('/seller/dashboard');
    return this.router.navigateByUrl('/dashboard');
  }
}