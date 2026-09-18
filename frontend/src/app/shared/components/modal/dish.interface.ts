export interface DishFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  active: boolean;
  displayOrder: number;
}

export interface CategoryOption {
  value: string;
  label: string;
}