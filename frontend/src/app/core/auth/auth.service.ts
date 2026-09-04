import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'current_user';

  #user = signal<User | null>(null);
  #token = signal<string | null>(null);

  user = this.#user.asReadonly();
  token = this.#token.asReadonly();
  isAuthenticated = computed(() => !!this.#token());
  isAdmin = computed(() => this.#user()?.role === 'ADMIN');
  isManager = computed(() => this.#user()?.role === 'MANAGER' || this.#user()?.role === 'ADMIN');
  isStaff = computed(() => ['ADMIN', 'MANAGER', 'STAFF'].includes(this.#user()?.role || ''));

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    if (token && userStr) {
      this.#token.set(token);
      this.#user.set(JSON.parse(userStr));
    }
  }

  private saveToStorage(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.#token.set(token);
    this.#user.set(user);
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.#token.set(null);
    this.#user.set(null);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/login`, credentials).pipe(
      tap(response => this.saveToStorage(response.accessToken, response.user))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/register`, data).pipe(
      tap(response => this.saveToStorage(response.accessToken, response.user))
    );
  }

  logout(): void {
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.authUrl}/refresh`, {}).pipe(
      tap(response => this.saveToStorage(response.accessToken, response.user)),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.#user();
  }

  getToken(): string | null {
    return this.#token();
  }

  updateUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.#user.set(user);
  }
}