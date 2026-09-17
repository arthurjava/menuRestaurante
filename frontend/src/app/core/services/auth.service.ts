import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '@environments/environment';
import { User } from '../models/user.model';
import { NotificationService } from './notification.service';

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notification = inject(NotificationService);

  private readonly _accessToken = signal<string | null>(null);
  private readonly _user = signal<User | null>(null);
  private readonly _isAuthenticated = computed(() => !!this._accessToken() && !!this._user());

  readonly accessToken = this._accessToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = this._isAuthenticated;
  readonly userName = computed(() => this._user()?.name ?? null);
  readonly userRole = computed(() => this._user()?.role ?? null);

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this._user.set(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/login`, credentials).pipe(
      tap(response => this.setSession(response)),
      catchError(error => {
        this.notification.error(error.error?.message ?? 'Erro ao fazer login');
        return of(null as unknown as AuthResponse);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/register`, data).pipe(
      tap(response => this.setSession(response)),
      catchError(error => {
        this.notification.error(error.error?.message ?? 'Erro ao cadastrar');
        return of(null as unknown as AuthResponse);
      })
    );
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${environment.authUrl}/refresh`, {}).pipe(
      tap(response => {
        this._accessToken.set(response.accessToken);
      }),
      catchError(error => {
        this.logout();
        return of(null as unknown as { accessToken: string });
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.authUrl}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(void 0);
      })
    );
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${environment.authUrl}/me`).pipe(
      tap(user => {
        this._user.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      }),
      catchError(() => {
        this.clearSession();
        return of(null as unknown as User);
      })
    );
  }

  getAccessToken(): string | null {
    return this._accessToken();
  }

  isLoggedIn(): boolean {
    return this._isAuthenticated();
  }

  getRole(): string | null {
    return this._userRole();
  }

  hasRole(role: string): boolean {
    return this._user()?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this._user()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  private setSession(response: AuthResponse): void {
    this._accessToken.set(response.accessToken);
    this._user.set(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  private clearSession(): void {
    this._accessToken.set(null);
    this._user.set(null);
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }

  private _userRole = computed(() => this._user()?.role ?? null);
}