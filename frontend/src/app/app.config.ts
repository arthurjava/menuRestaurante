import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { JwtInterceptor } from './core/jwt.interceptor';
import { getPtBrPaginatorIntl } from './shared/paginators/pt-br-paginator';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline',
        subscriptSizing: 'dynamic'
      }
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      }
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        closeOnNavigation: true,
        autoFocus: true
      }
    },
    {
      provide: MatPaginatorIntl,
      useValue: getPtBrPaginatorIntl()
    }
  ]
};