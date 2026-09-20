import { Injectable, inject, signal, computed, effect } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap, catchError, of, map } from "rxjs";
import { environment } from "@environments/environment";
import { User } from "../models/user.model";
import { NotificationService } from "./notification.service";

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
  role: "ADMIN" | "MANAGER" | "STAFF";
}

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";

function getStoredToken(): string | null {
  if (typeof window !== "undefined" && window.sessionStorage) {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
}

function setStoredToken(token: string): void {
  if (typeof window !== "undefined" && window.sessionStorage) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

function removeStoredToken(): void {
  if (typeof window !== "undefined" && window.sessionStorage) {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

function getStoredUser(): User | null {
  if (typeof window !== "undefined" && window.sessionStorage) {
    const stored = sessionStorage.getItem(USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

function setStoredUser(user: User): void {
  if (typeof window !== "undefined" && window.sessionStorage) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

function removeStoredUser(): void {
  if (typeof window !== "undefined" && window.sessionStorage) {
    sessionStorage.removeItem(USER_KEY);
  }
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notification = inject(NotificationService);

  private readonly _accessToken = signal<string | null>(getStoredToken());
  private readonly _user = signal<User | null>(getStoredUser());
  private readonly _isAuthenticated = computed(
    () => !!this._accessToken() && !!this._user(),
  );

  readonly accessToken = this._accessToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = this._isAuthenticated;
  readonly userName = computed(() => this._user()?.name ?? null);
  readonly userRole = computed(() => this._user()?.role ?? null);

  constructor() {
    // Session is restored from sessionStorage in signal initializers
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.authUrl}/login`, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.setSession(response)),
        catchError((error) => {
          this.notification.error(
            error.error?.message ?? "Erro ao fazer login",
          );
          return of(null as unknown as AuthResponse);
        }),
      );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.authUrl}/register`, data, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.setSession(response)),
        catchError((error) => {
          this.notification.error(error.error?.message ?? "Erro ao cadastrar");
          return of(null as unknown as AuthResponse);
        }),
      );
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return this.http
      .post<{ accessToken: string }>(
        `${environment.authUrl}/refresh`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap((response) => {
          this._accessToken.set(response.accessToken);
          setStoredToken(response.accessToken);
        }),
        catchError((error) => {
          this.logout();
          return of(null as unknown as { accessToken: string });
        }),
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(
        `${environment.authUrl}/logout`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => this.clearSession()),
        catchError(() => {
          this.clearSession();
          return of(void 0);
        }),
      );
  }

  getMe(): Observable<User> {
    return this.http
      .get<User>(`${environment.authUrl}/me`, {
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          this._user.set(user);
          setStoredUser(user);
        }),
        catchError(() => {
          this.clearSession();
          return of(null as unknown as User);
        }),
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
    setStoredToken(response.accessToken);
    setStoredUser(response.user);
  }

  private clearSession(): void {
    this._accessToken.set(null);
    this._user.set(null);
    removeStoredToken();
    removeStoredUser();
    this.router.navigate(["/auth/login"]);
  }

  private _userRole = computed(() => this._user()?.role ?? null);
}
