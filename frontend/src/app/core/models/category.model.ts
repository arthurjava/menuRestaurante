export interface Category {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  dishCount?: number;
}

export interface CategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export interface CategoryReorderRequest {
  id: string;
  displayOrder: number;
}