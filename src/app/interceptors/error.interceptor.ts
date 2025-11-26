import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 && err.status !== 403) {
        const msg = err.error?.message || err.message || 'Something went wrong';
        toastr.error(msg, `Error ${err.status || ''}`.trim());
      }
      return throwError(() => err);
    })
  );
};
