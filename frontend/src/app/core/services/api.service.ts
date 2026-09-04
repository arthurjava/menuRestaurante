import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse, PaginationParams } from '../models/api-response.model';
import { Category, CategoryRequest } from '../models/category.model';
import { Dish, DishRequest, DishFilters } from '../models/dish.model';
import { User, UserRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Auth
  login(data: { email: string; password: string }) {
    return this.http.post<{ accessToken: string; user: User }>(`${environment.authUrl}/login`, data);
  }

  register(data: { email: string; password: string; name: string }) {
    return this.http.post<{ accessToken: string; user: User }>(`${environment.authUrl}/register`, data);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  getCategoriesAdmin(params?: PaginationParams): Observable<PageResponse<Category>> {
    let httpParams = new HttpParams();
    if (params) {
      httpParams = httpParams.set('page', params.page).set('size', params.size);
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
    }
    return this.http.get<PageResponse<Category>>(`${this.baseUrl}/categories/admin`, { params: httpParams });
  }

  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/categories/${id}`);
  }

  createCategory(data: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, data);
  }

  updateCategory(id: string, data: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/categories/${id}`, data);
  }

  toggleCategoryActive(id: string): Observable<Category> {
    return this.http.patch<Category>(`${this.baseUrl}/categories/${id}/toggle-active`, {});
  }

  reorderCategories(data: { id: string; displayOrder: number }[]): Observable<Category[]> {
    return this.http.put<Category[]>(`${this.baseUrl}/categories/reorder`, data);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categories/${id}`);
  }

  // Dishes
  getDishes(filters?: DishFilters): Observable<PageResponse<Dish>> {
    let httpParams = new HttpParams();
    if (filters) {
      if (filters.name) httpParams = httpParams.set('name', filters.name);
      if (filters.categoryId) httpParams = httpParams.set('categoryId', filters.categoryId);
      if (filters.active !== undefined) httpParams = httpParams.set('active', filters.active);
      if (filters.page !== undefined) httpParams = httpParams.set('page', filters.page);
      if (filters.size !== undefined) httpParams = httpParams.set('size', filters.size);
      if (filters.sort) httpParams = httpParams.set('sort', filters.sort);
    }
    return this.http.get<PageResponse<Dish>>(`${this.baseUrl}/dishes`, { params: httpParams });
  }

  getDishesAdmin(params?: PaginationParams): Observable<PageResponse<Dish>> {
    let httpParams = new HttpParams();
    if (params) {
      httpParams = httpParams.set('page', params.page).set('size', params.size);
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
    }
    return this.http.get<PageResponse<Dish>>(`${this.baseUrl}/dishes/admin`, { params: httpParams });
  }

  getDish(id: string): Observable<Dish> {
    return this.http.get<Dish>(`${this.baseUrl}/dishes/${id}`);
  }

  createDish(data: DishRequest): Observable<Dish> {
    return this.http.post<Dish>(`${this.baseUrl}/dishes`, data);
  }

  updateDish(id: string, data: DishRequest): Observable<Dish> {
    return this.http.put<Dish>(`${this.baseUrl}/dishes/${id}`, data);
  }

  toggleDishActive(id: string): Observable<Dish> {
    return this.http.patch<Dish>(`${this.baseUrl}/dishes/${id}/toggle-active`, {});
  }

  deleteDish(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/dishes/${id}`);
  }

  // Users
  getUsers(params?: PaginationParams): Observable<PageResponse<User>> {
    let httpParams = new HttpParams();
    if (params) {
      httpParams = httpParams.set('page', params.page).set('size', params.size);
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
    }
    return this.http.get<PageResponse<User>>(`${this.baseUrl}/users`, { params: httpParams });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }

  createUser(data: UserRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, data);
  }

  updateUser(id: string, data: UserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, data);
  }

  toggleUserActive(id: string): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}/toggle-active`, {});
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  // Menu (public)
  getFullMenu(): Observable<Record<string, Dish[]>> {
    return this.http.get<Record<string, Dish[]>>(`${this.baseUrl}/menu`);
  }

  getMenuCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/menu/categories`);
  }

  getDishesByCategory(categoryId: string): Observable<Dish[]> {
    return this.http.get<Dish[]>(`${this.baseUrl}/menu/categories/${categoryId}/dishes`);
  }

  // Profile
  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.authUrl}/me`);
  }

  updateProfile(data: Partial<UserRequest>): Observable<User> {
    return this.http.put<User>(`${environment.authUrl}/me`, data);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${environment.authUrl}/me/password`, { currentPassword, newPassword });
  }
}