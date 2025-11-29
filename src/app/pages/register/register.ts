import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

type RegControls = {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  regForm: FormGroup<RegControls>;
  isSubmitting = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    public router: Router,
    private toastr: ToastrService
  ) {
    this.regForm = this.fb.group({
      name: this.fb.nonNullable.control('', Validators.required),
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)])
    });
  }

  t = <K extends keyof RegControls>(key: K) => this.regForm.controls[key];

  submit() {
    this.submitted = true;

    if (this.regForm.invalid) {
      this.regForm.markAllAsTouched();
      this.toastr.warning('Please fix the errors and try again.');
      return;
    }

    this.isSubmitting = true;

    this.auth.register(this.regForm.getRawValue()).subscribe({
      next: () => {
        this.toastr.success('Welcome to EcoBazaar! Please log in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err?.error?.message || 'Registration failed. Please try again.';
        this.toastr.error(msg);
      },
      complete: () => this.isSubmitting = false
    });
  }
}