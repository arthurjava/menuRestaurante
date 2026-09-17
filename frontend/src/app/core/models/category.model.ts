export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}