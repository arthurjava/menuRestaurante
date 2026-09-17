import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${environment.authUrl}/login`, { email, password })
      .pipe(
        tap((response: { token: string }) => localStorage.setItem(this.tokenKey, response.token)),
        map((response: { token: string }) => response.token)
      );
  }

  register(user: { email: string; password: string; name: string; role: string }): Observable<any> {
    return this.http.post(`${environment.authUrl}/register`, user);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.authUrl}/logout`, {});
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getName(): string | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.name;
    }
    return null;
  }
}