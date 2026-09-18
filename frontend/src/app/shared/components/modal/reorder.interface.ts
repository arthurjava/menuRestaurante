export interface ReorderItem {
  id: string;
  name: string;
  displayOrder: number;
  active: boolean;
  subtitle?: string;
}

export interface ReorderModalConfig {
  title: string;
  description: string;
  confirmLabel: string;
  emptyMessage: string;
  getItemSubtitle?: (item: ReorderItem) => string;
  getItemStatus?: (item: ReorderItem) => { label: string; variant: 'success' | 'gray' | 'warning' | 'danger' };
}