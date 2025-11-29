import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

import { NgChartsModule } from 'ng2-charts';
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([
        LoadingInterceptor,
        AuthInterceptor,
        ErrorInterceptor
      ])
    ),
    importProvidersFrom(
      NgChartsModule,
      NgxSpinnerModule,
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 2500,
        closeButton: true,
        progressBar: true,
        preventDuplicates: true
      })
    )
  ]
};