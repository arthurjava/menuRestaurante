import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Dish, Category } from '../../../core/models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { TableComponent, TableColumn, TableAction } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-dish-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent, InputComponent, SelectComponent, TableComponent, ModalComponent, BadgeComponent, LoadingSpinnerComponent, CurrencyBrlPipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title">Pratos</h1>
          <p class="page-subtitle">Gerencie os pratos do cardápio</p>
        </div>
        <app-button variant="primary" routerLink="/dishes/new">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Novo Prato
        </app-button>
      </div>

      <div class="card">
        <div class="p-4 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <app-input
                id="search"
                placeholder="Buscar pratos..."
                [ngModel]="filters().name"
                (ngModelChange)="onNameFilterChange($event)"
              ></app-input>
            </div>
            <div class="w-full sm:w-48">
              <app-select
                id="categoryFilter"
                placeholder="Todas as categorias"
                [options]="categoryOptions()"
                [ngModel]="filters().categoryId"
                (ngModelChange)="onCategoryFilterChange($event)"
              ></app-select>
            </div>
            <div class="w-full sm:w-48">
              <app-select
                id="statusFilter"
                placeholder="Todos os status"
                [options]="statusOptions"
                [ngModel]="filters().active"
                (ngModelChange)="onStatusFilterChange($event)"
              ></app-select>
            </div>
          </div>
        </div>

        <app-table
          [data]="dishes()"
          [columns]="columns"
          [actions]="actions"
          [pagination]="pagination()"
          [trackByFn]="trackById"
          [emptyMessage]="'Nenhum prato encontrado'"
          (pageChange)="onPageChange($event)"
          (sort)="onSort($event)"
        ></app-table>
      </div>
    </div>

    <app-modal
      [isOpen]="deleteModalOpen()"
      title="Excluir prato"
      (close)="deleteModalOpen.set(false)"
    >
      <p class="text-gray-600">Tem certeza que deseja excluir o prato <strong>{{ dishToDelete()?.name }}</strong>? Esta ação não pode ser desfeita.</p>
      <div slot="footer" class="flex justify-end gap-3">
        <app-button variant="secondary" (click)="deleteModalOpen.set(false)">Cancelar</app-button>
        <app-button variant="danger" (click)="confirmDelete()" [loading]="deleting()">Excluir</app-button>
      </div>
    </app-modal>
  `
})
export class DishListComponent implements OnInit {
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  loadingService = inject(LoadingService);

  dishes = signal<Dish[]>([]);
  categories = signal<Category[]>([]);
  pagination = signal({ page: 0, size: 20, totalElements: 0, totalPages: 0 });
  sortKey = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  filters = signal({
    name: '',
    categoryId: '',
    active: ''
  });

  deleteModalOpen = signal(false);
  dishToDelete = signal<Dish | null>(null);
  deleting = signal(false);

  categoryOptions = computed(() => 
    this.categories().map(c => ({ value: c.id, label: c.name }))
  );

  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Ativos' },
    { value: 'false', label: 'Inativos' }
  ];

  columns: TableColumn<Dish>[] = [
    { key: 'imageUrl', header: '', render: (dish) => dish.imageUrl ? `<img src="${dish.imageUrl}" class="w-12 h-12 rounded object-cover">` : '<div class="w-12 h-12 rounded bg-gray-100"></div>', class: 'w-16' },
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'categoryName', header: 'Categoria', sortable: true },
    { key: 'price', header: 'Preço', sortable: true, render: (dish) => `<span class="font-semibold">{{ dish.price | currencyBrl }}</span>` },
    { key: 'prepTimeMinutes', header: 'Tempo', sortable: true, render: (dish) => dish.prepTimeMinutes ? `${dish.prepTimeMinutes} min` : '-' },
    { key: 'active', header: 'Status', render: (dish) => dish.active ? '<app-badge variant="success">Ativo</app-badge>' : '<app-badge variant="gray">Inativo</app-badge>' },
    { key: 'createdAt', header: 'Criado em', sortable: true, render: (dish) => new Date(dish.createdAt).toLocaleDateString('pt-BR') }
  ];

  actions: TableAction<Dish>[] = [
    {
      label: 'Ver',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7z',
      handler: (dish) => window.location.href = `/dishes/${dish.id}`,
      class: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Editar',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
      handler: (dish) => window.location.href = `/dishes/${dish.id}/edit`
    },
    {
      label: 'Ativar/Desativar',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      handler: (dish) => this.toggleActive(dish),
      class: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Excluir',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      handler: (dish) => this.openDeleteModal(dish),
      class: 'text-red-600 hover:text-red-900'
    }
  ];

  trackById = (item: Dish) => item.id;

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadCategories(), this.loadDishes()]);
  }

  async loadCategories(): Promise<void> {
    try {
      const res = await this.apiService.getCategories().toPromise();
      this.categories.set(res || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }

  async loadDishes(): Promise<void> {
    try {
      const params = {
        page: this.pagination().page,
        size: this.pagination().size,
        sort: `${this.sortKey},${this.sortDirection}`,
        ...(this.filters().name && { name: this.filters().name }),
        ...(this.filters().categoryId && { categoryId: this.filters().categoryId }),
        ...(this.filters().active && { active: this.filters().active === 'true' })
      };

      const res = await this.apiService.getDishes(params).toPromise();
      this.dishes.set(res?.content || []);
      this.pagination.update(p => ({
        ...p,
        totalElements: res?.totalElements || 0,
        totalPages: res?.totalPages || 0
      }));
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível carregar os pratos');
    }
  }

  onSearchChange(): void {
    this.pagination.update(p => ({ ...p, page: 0 }));
    this.loadDishes();
  }

  onNameFilterChange(value: string): void {
    this.filters.update(f => ({ ...f, name: value }));
    this.onSearchChange();
  }

  onCategoryFilterChange(value: string): void {
    this.filters.update(f => ({ ...f, categoryId: value }));
    this.onSearchChange();
  }

  onStatusFilterChange(value: string): void {
    this.filters.update(f => ({ ...f, active: value }));
    this.onSearchChange();
  }

  onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadDishes();
  }

  onSort(event: { key: string; direction: 'asc' | 'desc' }): void {
    this.sortKey = event.key;
    this.sortDirection = event.direction;
    this.loadDishes();
  }

  async toggleActive(dish: Dish): Promise<void> {
    try {
      await this.apiService.toggleDishActive(dish.id).toPromise();
      this.notificationService.success('Sucesso', `Prato ${dish.active ? 'desativado' : 'ativado'}`);
      this.loadDishes();
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível alterar o status');
    }
  }

  openDeleteModal(dish: Dish): void {
    this.dishToDelete.set(dish);
    this.deleteModalOpen.set(true);
  }

  async confirmDelete(): Promise<void> {
    const dish = this.dishToDelete();
    if (!dish) return;

    this.deleting.set(true);
    try {
      await this.apiService.deleteDish(dish.id).toPromise();
      this.notificationService.success('Sucesso', 'Prato excluído');
      this.deleteModalOpen.set(false);
      this.loadDishes();
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível excluir o prato');
    } finally {
      this.deleting.set(false);
    }
  }
}