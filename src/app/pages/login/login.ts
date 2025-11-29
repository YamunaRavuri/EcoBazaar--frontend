import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  email = '';
  password = '';
  isLoggingIn = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  submit(form: NgForm) {
    if (form.invalid) {
      this.toastr.warning('Please fix the errors and try again.');
      return;
    }

    this.isLoggingIn = true;

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoggingIn = false;
        this.toastr.success('Welcome back!');
        const role = this.auth.getRole();
        if (role === 'ROLE_ADMIN') {
          this.router.navigate(['/admin']);
        } else if (role === 'ROLE_SELLER') {
          this.router.navigate(['/seller/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoggingIn = false;
        this.toastr.error(err.error?.message || 'Login failed. Please try again.');
      }
    });
  }
}