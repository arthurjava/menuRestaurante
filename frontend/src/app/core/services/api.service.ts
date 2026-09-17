import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:8080/api';
  private authUrl = 'http://localhost:8080/api/auth';

  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string | null): void {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.authUrl}/login`, { email, password })
      .pipe(
        tap((response: { token: string }) => this.setToken(response.token)),
        catchError(error => {
          console.error('Login error', error);
          return of(null);
        })
      );
  }

  register(user: { email: string; password: string; name: string; role: string }): Observable<any> {
    return this.http.post(`${this.authUrl}/register`, user);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/logout`, {});
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.authUrl}/me`, { headers: this.getHeaders() });
  }

  // Categories
  listCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  listCategoriesAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories/admin`);
  }

  createCategory(category: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, category, { headers: this.getHeaders() });
  }

  updateCategory(id: string, category: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/categories/${id}`, category, { headers: this.getHeaders() });
  }

  toggleCategoryActive(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/categories/${id}/toggle-active`, {}, { headers: this.getHeaders() });
  }

  // Dishes
  listDishes(filters?: { category?: string; active?: boolean; search?: string }): Observable<any[]> {
    let url = `${this.apiUrl}/dishes`;
    const params: any[] = [];
    if (filters?.category) params.push(`category=${filters.category}`);
    if (filters?.active !== undefined) params.push(`active=${filters.active}`);
    if (filters?.search) params.push(`search=${filters.search}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    return this.http.get<any[]>(url);
  }

  listDishesAdmin(filters?: { active?: boolean }): Observable<any[]> {
    let url = `${this.apiUrl}/dishes/admin`;
    const params: any[] = [];
    if (filters?.active !== undefined) params.push(`active=${filters.active}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    return this.http.get<any[]>(url, { headers: this.getHeaders() });
  }

  createDish(dish: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/dishes`, dish, { headers: this.getHeaders() });
  }

  updateDish(id: string, dish: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/dishes/${id}`, dish, { headers: this.getHeaders() });
  }

  toggleDishActive(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/dishes/${id}/toggle-active`, {}, { headers: this.getHeaders() });
  }

  // Images
  uploadImages(dishId: string, files: FileList): Observable<any> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    return this.http.post(`${this.apiUrl}/dishes/${dishId}/images`, formData, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
  }

  removeImage(imageId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/dishes/images/${imageId}`, {
      headers: this.getHeaders()
    });
  }
}