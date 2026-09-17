import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  displayOrder: number;
  isMain: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadImages(dishId: string, files: FileList): Observable<UploadedImage[]> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    return this.http.post<UploadedImage[]>(`${this.apiUrl}/dishes/${dishId}/images`, formData);
  }

  removeImage(imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/dishes/images/${imageId}`);
  }

  reorderImages(dishId: string, imageIds: string[]): Observable<UploadedImage[]> {
    return this.http.put<UploadedImage[]>(`${this.apiUrl}/dishes/${dishId}/images/reorder`, { imageIds });
  }

  setMainImage(dishId: string, imageId: string): Observable<UploadedImage> {
    return this.http.patch<UploadedImage>(`${this.apiUrl}/dishes/${dishId}/images/${imageId}/main`, {});
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Formato inválido. Use JPEG, PNG ou WebP.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande. Tamanho máximo: 5MB.' };
    }

    return { valid: true };
  }

  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}