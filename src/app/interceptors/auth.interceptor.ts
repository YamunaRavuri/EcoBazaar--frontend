import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  const token = localStorage.getItem('token') || '';
  const skipAuthFor = ['api.cloudinary.com'];
  const shouldSkip = skipAuthFor.some(d => req.url.includes(d));

  if (token && !shouldSkip) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        toastr.error('Your session has expired. Please login again.', 'Unauthorized');
        localStorage.clear();
        router.navigate(['/login']);
      } else if (err.status === 403) {
        toastr.error('You are not allowed to access this resource.', 'Forbidden');
      }
      return throwError(() => err);
    })
  );
};