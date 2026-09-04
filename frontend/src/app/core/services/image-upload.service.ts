import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DishImage } from '../models/dish.model';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadDishImages(dishId: string, files: File[], replace = false): Observable<DishImage[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('replace', String(replace));
    
    return this.http.post<DishImage[]>(`${this.baseUrl}/dishes/${dishId}/images`, formData);
  }

  deleteDishImage(dishId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/dishes/${dishId}/images/${imageId}`);
  }

  reorderDishImages(dishId: string, imageOrders: { id: string; displayOrder: number }[]): Observable<DishImage[]> {
    return this.http.put<DishImage[]>(`${this.baseUrl}/dishes/${dishId}/images/reorder`, imageOrders);
  }

  setPrimaryImage(dishId: string, imageId: string): Observable<DishImage> {
    return this.http.patch<DishImage>(`${this.baseUrl}/dishes/${dishId}/images/${imageId}/primary`, {});
  }
}