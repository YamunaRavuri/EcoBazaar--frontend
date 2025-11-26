import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { CloudinaryService } from '../../services/cloudinary';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-seller-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './seller-product.html'
})
export class SellerProduct implements OnInit {
  private fb = inject(FormBuilder);
  private cloud = inject(CloudinaryService);
  private productSvc = inject(ProductService);
  public router = inject(Router);
  private toastr = inject(ToastrService);

  editing = false;
  editingId?: number;

  form = this.fb.group({
    name: ['', Validators.required],
    details: ['', [Validators.maxLength(500)]],
    price: [0, [Validators.required, Validators.min(0)]],
    carbonImpact: [0, [Validators.min(0)]],
    ecoCertified: [false]
  });

  selectedFile?: File;
  previewUrl: string | null = null;
  uploading = false;
  error: string | null = null;
  submitted = false;
  fileError: string | null = null;

  ngOnInit() {
    const state: any = history.state;
    if (state && state.product) {
      const p = state.product;
      this.editing = true;
      this.editingId = p.id;
      this.form.patchValue({
        name: p.name || '',
        details: p.details || '',
        price: Number(p.price ?? 0),
        carbonImpact: Number(p.carbonImpact ?? 0),
        ecoCertified: !!(p.ecoRequested ?? p.ecoCertified)
      });
      this.previewUrl = p.imageUrl || null;
    }
  }

  t = (k: 'name' | 'details' | 'price' | 'carbonImpact' | 'ecoCertified') => this.form.controls[k];

  onFileChange(ev: Event) {
    this.fileError = null;
    const input = ev.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];

      // Basic client-side checks (1) type (2) size ≤ 5MB
      const isImage = /^image\//.test(file.type);
      const okSize = file.size <= 5 * 1024 * 1024;
      if (!isImage) {
        this.fileError = 'Please select an image file.';
        return;
      }
      if (!okSize) {
        this.fileError = 'Image must be 5 MB or smaller.';
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  submit() {
    this.submitted = true;
    this.error = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Please fix the errors and try again.');
      return;
    }
    if (this.fileError) {
      this.toastr.error(this.fileError);
      return;
    }

    this.uploading = true;

    const sendPayload = (imageUrl?: string | null) => {
      const payload: any = {
        name: this.form.value.name,
        details: this.form.value.details,
        price: Number(this.form.value.price),
        carbonImpact: Number(this.form.value.carbonImpact),
        ecoRequested: Boolean(this.form.value.ecoCertified),
        imageUrl: imageUrl || null
      };

      const obs = this.editing && this.editingId
        ? this.productSvc.update(this.editingId, payload)
        : this.productSvc.create(payload);

      obs.subscribe({
        next: () => {
          this.uploading = false;
          this.toastr.success(this.editing ? 'Product updated' : 'Product created');
          this.router.navigate(['/seller/dashboard']);
        },
        error: (err) => {
          console.error(err);
          this.uploading = false;
          const msg = err?.error?.message || err?.message || 'Failed to save product';
          this.error = msg;
          this.toastr.error(msg);
        }
      });
    };

    // If a new file is selected, upload to Cloudinary first
    if (this.selectedFile) {
      this.cloud.uploadFile(this.selectedFile).subscribe({
        next: (res: any) => {
          const url = res?.secure_url || res?.url || null;
          if (!url) {
            this.uploading = false;
            const msg = 'Upload succeeded but no URL returned';
            this.error = msg;
            this.toastr.error(msg);
            return;
          }
          sendPayload(url);
        },
        error: (err) => {
          console.error(err);
          this.uploading = false;
          const msg = err?.error?.message || err?.message || 'Image upload failed';
          this.error = msg;
          this.toastr.error(msg);
        }
      });
    } else {
      // No new file: keep existing previewUrl (if any) or null
      sendPayload(this.previewUrl || null);
    }
  }
}
