import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
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
    this.regForm = this.fb.group<RegControls>({
      name: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })
    });
  }

  // strongly-typed accessor
  t = (k: keyof RegControls) => this.regForm.controls[k];

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
        this.isSubmitting = false;
        this.toastr.success('Registered successfully. Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err?.error?.message || err?.error || err?.message || 'Registration failed';
        this.toastr.error(msg);
      }
    });
  }
}
