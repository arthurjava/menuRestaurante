import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, catchError, tap, throwError } from "rxjs";
import { environment } from "@environments/environment";
import { LoadingService } from "./loading.service";
import { NotificationService } from "./notification.service";

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface FilterParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  active?: boolean;
  category?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private http = inject(HttpClient);
  private loading = inject(LoadingService);
  private notification = inject(NotificationService);

  private readonly apiUrl = environment.apiUrl;

  private getHeaders(customHeaders?: HttpHeaders): HttpHeaders {
    let headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    if (customHeaders) {
      headers = customHeaders;
    }

    return headers;
  }

  private buildParams(params: FilterParams): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }

  // Generic GET
  get<T>(endpoint: string, params?: FilterParams): Observable<T> {
    this.loading.show();
    return this.http
      .get<T>(`${this.apiUrl}${endpoint}`, {
        headers: this.getHeaders(),
        params: params ? this.buildParams(params) : undefined,
        withCredentials: true,
      })
      .pipe(
        tap(() => this.loading.hide()),
        catchError((error) => this.handleError(error)),
      );
  }

  // Generic POST
  post<T>(
    endpoint: string,
    body: any,
    options?: { headers?: HttpHeaders; showLoading?: boolean },
  ): Observable<T> {
    const showLoading = options?.showLoading ?? true;
    if (showLoading) this.loading.show();
    return this.http
      .post<T>(`${this.apiUrl}${endpoint}`, body, {
        headers: options?.headers ?? this.getHeaders(),
        withCredentials: true,
      })
      .pipe(
        tap(() => {
          if (showLoading) this.loading.hide();
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  // Generic PUT
  put<T>(endpoint: string, body: any): Observable<T> {
    this.loading.show();
    return this.http
      .put<T>(`${this.apiUrl}${endpoint}`, body, {
        headers: this.getHeaders(),
        withCredentials: true,
      })
      .pipe(
        tap(() => this.loading.hide()),
        catchError((error) => this.handleError(error)),
      );
  }

  // Generic PATCH
  patch<T>(endpoint: string, body: any): Observable<T> {
    this.loading.show();
    return this.http
      .patch<T>(`${this.apiUrl}${endpoint}`, body, {
        headers: this.getHeaders(),
        withCredentials: true,
      })
      .pipe(
        tap(() => this.loading.hide()),
        catchError((error) => this.handleError(error)),
      );
  }

  // Generic DELETE
  delete<T>(endpoint: string): Observable<T> {
    this.loading.show();
    return this.http
      .delete<T>(`${this.apiUrl}${endpoint}`, {
        headers: this.getHeaders(),
        withCredentials: true,
      })
      .pipe(
        tap(() => this.loading.hide()),
        catchError((error) => this.handleError(error)),
      );
  }

  // File upload - don't set Content-Type, let browser set it with boundary
  upload<T>(endpoint: string, formData: FormData): Observable<T> {
    this.loading.show();
    return this.http
      .post<T>(`${this.apiUrl}${endpoint}`, formData, {
        withCredentials: true,
      })
      .pipe(
        tap(() => this.loading.hide()),
        catchError((error) => this.handleError(error)),
      );
  }

  private handleError(error: any): Observable<never> {
    this.loading.hide();
    const message = error.error?.message ?? error.message ?? "Erro inesperado";
    this.notification.error(message);
    return throwError(() => error);
  }

  // Categories
  listCategories(params?: FilterParams): Observable<any[]> {
    return this.get<any[]>("/categories", params);
  }

  listCategoriesAdmin(params?: FilterParams): Observable<any[]> {
    return this.get<any[]>("/categories/admin", params);
  }

  createCategory(category: any): Observable<any> {
    return this.post<any>("/categories", category);
  }

  updateCategory(id: string, category: any): Observable<any> {
    return this.put<any>(`/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.delete<void>(`/categories/${id}`);
  }

  toggleCategoryActive(id: string): Observable<any> {
    return this.patch<any>(`/categories/${id}/toggle-active`, {});
  }

  reorderCategories(
    items: { id: string; displayOrder: number }[],
  ): Observable<any> {
    return this.put<any>("/categories/reorder", { items });
  }

  // Dishes
  listDishes(params?: FilterParams): Observable<any[]> {
    return this.get<any[]>("/dishes", params);
  }

  listDishesAdmin(params?: FilterParams): Observable<any[]> {
    return this.get<any[]>("/dishes/admin", params);
  }

  createDish(dish: any): Observable<any> {
    return this.post<any>("/dishes", dish);
  }

  updateDish(id: string, dish: any): Observable<any> {
    return this.put<any>(`/dishes/${id}`, dish);
  }

  deleteDish(id: string): Observable<void> {
    return this.delete<void>(`/dishes/${id}`);
  }

  toggleDishActive(id: string): Observable<any> {
    return this.patch<any>(`/dishes/${id}/toggle-active`, {});
  }

  reorderDishes(
    items: { id: string; displayOrder: number }[],
  ): Observable<any> {
    return this.put<any>("/dishes/reorder", { items });
  }

  // Images
  uploadImages(dishId: string, formData: FormData): Observable<any[]> {
    return this.upload<any[]>(`/dishes/${dishId}/images`, formData);
  }

  removeImage(imageId: string): Observable<void> {
    return this.delete<void>(`/dishes/images/${imageId}`);
  }

  // Users
  listUsers(params?: FilterParams): Observable<any[]> {
    return this.get<any[]>("/users", params);
  }

  createUser(user: any): Observable<any> {
    return this.post<any>("/users", user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.put<any>(`/users/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.delete<void>(`/users/${id}`);
  }

  toggleUserActive(id: string): Observable<any> {
    return this.patch<any>(`/users/${id}/toggle-active`, {});
  }

  // Settings (Admin)
  getRestaurantInfo(): Observable<any> {
    return this.get<any>("/settings/restaurant-info");
  }

  updateRestaurantInfo(data: any): Observable<any> {
    return this.put<any>("/settings/restaurant-info", data);
  }

  getBusinessHours(): Observable<any[]> {
    return this.get<any[]>("/settings/business-hours");
  }

  updateBusinessHours(data: any[]): Observable<any> {
    return this.put<any>("/settings/business-hours", data);
  }

  getContactInfo(): Observable<any> {
    return this.get<any>("/settings/contact-info");
  }

  updateContactInfo(data: any): Observable<any> {
    return this.put<any>("/settings/contact-info", data);
  }

  getProfile(): Observable<any> {
    return this.get<any>("/settings/profile");
  }

  updateProfile(data: any): Observable<any> {
    return this.put<any>("/settings/profile", data);
  }

  resetPassword(userId: string): Observable<{ tempPassword: string }> {
    return this.post<{ tempPassword: string }>(
      `/users/${userId}/reset-password`,
      {},
    );
  }

  // Public Menu
  getPublicMenu(params?: FilterParams): Observable<any[]> {
    return this.get<any[]>("/menu", params);
  }

  getPublicCategories(): Observable<any[]> {
    return this.get<any[]>("/menu/categories");
  }

  getPublicRestaurantInfo(): Observable<any> {
    return this.get<any>("/menu/restaurant-info");
  }

  getPublicBusinessHours(): Observable<any> {
    return this.get<any>("/menu/business-hours");
  }

  getPublicContactInfo(): Observable<any> {
    return this.get<any>("/menu/contact-info");
  }
}