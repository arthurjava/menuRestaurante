import { Injectable, inject } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from "@angular/common/http";
import {
  Observable,
  throwError,
  BehaviorSubject,
  switchMap,
  filter,
  take,
  catchError,
} from "rxjs";
import { AuthService } from "./services/auth.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    // Skip auth for public endpoints
    if (this.isPublicRequest(request.url)) {
      return next.handle(request);
    }

    const token = this.authService.getAccessToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRefreshTokenRequest(request.url)) {
          return this.handle401Error(request, next);
        }
        if (error.status === 403) {
          this.authService.logout();
        }
        return throwError(() => error);
      }),
    );
  }

  private isPublicRequest(url: string): boolean {
    const publicEndpoints = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/refresh",
      "/api/menu",
      "/api/menu/categories",
      "/api/menu/restaurant-info",
      "/api/menu/business-hours",
      "/api/menu/contact-info",
      "/api/categories",
    ];
    return publicEndpoints.some((endpoint) => url.includes(endpoint));
  }

  private isRefreshTokenRequest(url: string): boolean {
    return url.includes("/auth/refresh");
  }

  private addToken(
    request: HttpRequest<unknown>,
    token: string,
  ): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
  }

  private handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response: { accessToken: string } | null) => {
          this.isRefreshing = false;
          if (!response?.accessToken) {
            this.authService.logout();
            return throwError(() => new Error('Token refresh failed'));
          }
          this.refreshTokenSubject.next(response.accessToken);
          return next.handle(this.addToken(request, response.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        }),
      );
    }

    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addToken(request, token!))),
    );
  }
}
