import { HttpInterceptorFn, HttpResponse, HttpEvent } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event: HttpEvent<unknown>) => {
      if (event instanceof HttpResponse) {
        const body = event.body as ApiResponse<unknown> | null;
        
        if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
          if (body.success && body.data !== undefined) {
            return event.clone({ body: body.data });
          }
          
          if (!body.success) {
            const errorMessage = body.message || body.error || 'Erro desconhecido';
            return event.clone({ 
              body: { error: errorMessage, errors: body.errors },
              status: 400,
              statusText: errorMessage
            });
          }
        }
      }
      return event;
    })
  );
};