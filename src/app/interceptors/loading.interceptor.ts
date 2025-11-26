import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

export const LoadingInterceptor: HttpInterceptorFn = (req, next) => {
  const spinner = inject(NgxSpinnerService);

  const skipUrls = ['api.cloudinary.com'];
  const shouldSkip = skipUrls.some(url => req.url.includes(url));

  if (!shouldSkip) spinner.show();

  return next(req).pipe(
    finalize(() => {
      if (!shouldSkip) spinner.hide();
    })
  );
};
