export interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  prepTimeMinutes: number | null;
  calories: number | null;
  allergens: string | null;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  images: DishImage[];
}

export interface DishImage {
  id: string;
  dishId: string;
  imageUrl: string;
  primary: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface DishRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  prepTimeMinutes?: number;
  calories?: number;
  allergens?: string;
  imageUrl?: string;
}

export interface DishFilters {
  name?: string;
  categoryId?: string;
  active?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}