import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Category, CategoryRequest } from '../../core/models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { TableComponent, TableColumn, TableAction } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonComponent, InputComponent, TableComponent, ModalComponent, BadgeComponent, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title">Categorias</h1>
          <p class="page-subtitle">Gerencie as categorias do cardápio</p>
        </div>
        <app-button variant="primary" routerLink="/categories/new">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Nova Categoria
        </app-button>
      </div>

      <div class="card">
        <div class="p-4 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <app-input
                id="search"
                placeholder="Buscar categorias..."
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearchChange()"
              ></app-input>
            </div>
          </div>
        </div>

        <app-table
          [data]="categories()"
          [columns]="columns"
          [actions]="actions"
          [pagination]="pagination()"
          [trackByFn]="trackById"
          [emptyMessage]="'Nenhuma categoria encontrada'"
          (pageChange)="onPageChange($event)"
          (sort)="onSort($event)"
        ></app-table>
      </div>
    </div>

    <app-modal
      [isOpen]="deleteModalOpen()"
      title="Excluir categoria"
      (close)="deleteModalOpen.set(false)"
    >
      <p class="text-gray-600">Tem certeza que deseja excluir a categoria <strong>{{ categoryToDelete()?.name }}</strong>? Esta ação não pode ser desfeita.</p>
      <div slot="footer" class="flex justify-end gap-3">
        <app-button variant="secondary" (click)="deleteModalOpen.set(false)">Cancelar</app-button>
        <app-button variant="danger" (click)="confirmDelete()" [loading]="deleting()">Excluir</app-button>
      </div>
    </app-modal>

    <app-modal
      [isOpen]="reorderModalOpen()"
      title="Reordenar categorias"
      [large]="true"
      (close)="reorderModalOpen.set(false)"
    >
      <div class="space-y-3 max-h-96 overflow-y-auto">
        @for (cat of reorderCategories(); track cat.id; let i = $index) {
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600"
              (mousedown)="startDrag(i, $event)"
              (click)="moveUp(i)"
              disabled="i === 0"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
            </button>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600"
              (mousedown)="startDrag(i, $event)"
              (click)="moveDown(i)"
              disabled="i === reorderCategories().length - 1"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <span class="flex-1 font-medium">{{ cat.name }}</span>
            <span class="text-sm text-gray-500">Ordem: {{ i + 1 }}</span>
          </div>
        }
      </div>
      <div slot="footer" class="flex justify-end gap-3">
        <app-button variant="secondary" (click)="reorderModalOpen.set(false)">Cancelar</app-button>
        <app-button variant="primary" (click)="saveReorder()" [loading]="savingReorder()">Salvar ordem</app-button>
      </div>
    </app-modal>
  `
})
export class CategoryListComponent implements OnInit {
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  loadingService = inject(LoadingService);

  categories = signal<Category[]>([]);
  pagination = signal({ page: 0, size: 20, totalElements: 0, totalPages: 0 });
  searchTerm = '';
  sortKey = 'displayOrder';
  sortDirection: 'asc' | 'desc' = 'asc';

  deleteModalOpen = signal(false);
  categoryToDelete = signal<Category | null>(null);
  deleting = signal(false);

  reorderModalOpen = signal(false);
  reorderCategories = signal<Category[]>([]);
  savingReorder = signal(false);
  dragIndex = signal<number | null>(null);

  columns: TableColumn<Category>[] = [
    { key: 'imageUrl', header: '', render: (cat) => cat.imageUrl ? `<img src="${cat.imageUrl}" class="w-10 h-10 rounded object-cover">` : '<div class="w-10 h-10 rounded bg-gray-100"></div>', class: 'w-12' },
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'displayOrder', header: 'Ordem', sortable: true },
    { key: 'active', header: 'Status', render: (cat) => cat.active ? '<app-badge variant="success">Ativa</app-badge>' : '<app-badge variant="gray">Inativa</app-badge>' },
    { key: 'dishCount', header: 'Pratos', sortable: true },
    { key: 'createdAt', header: 'Criado em', sortable: true, render: (cat) => new Date(cat.createdAt).toLocaleDateString('pt-BR') }
  ];

  actions: TableAction<Category>[] = [
    {
      label: 'Editar',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
      handler: (cat) => window.location.href = `/categories/${cat.id}/edit`
    },
    {
      label: 'Ativar/Desativar',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      handler: (cat) => this.toggleActive(cat),
      class: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Excluir',
      icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
      handler: (cat) => this.openDeleteModal(cat),
      class: 'text-red-600 hover:text-red-900'
    }
  ];

  trackById = (index: number, item: Category) => item.id;

  async ngOnInit(): Promise<void> {
    await this.loadCategories();
  }

  async loadCategories(): Promise<void> {
    try {
      const res = await this.apiService.getCategoriesAdmin({
        page: this.pagination().page,
        size: this.pagination().size,
        sort: `${this.sortKey},${this.sortDirection}`
      }).toPromise();

      this.categories.set(res?.content || []);
      this.pagination.update(p => ({
        ...p,
        totalElements: res?.totalElements || 0,
        totalPages: res?.totalPages || 0
      }));
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível carregar as categorias');
    }
  }

  onSearchChange(): void {
    this.pagination.update(p => ({ ...p, page: 0 }));
    this.loadCategories();
  }

  onPageChange(page: number): void {
    this.pagination.update(p => ({ ...p, page }));
    this.loadCategories();
  }

  onSort(event: { key: string; direction: 'asc' | 'desc' }): void {
    this.sortKey = event.key;
    this.sortDirection = event.direction;
    this.loadCategories();
  }

  async toggleActive(category: Category): Promise<void> {
    try {
      await this.apiService.toggleCategoryActive(category.id).toPromise();
      this.notificationService.success('Sucesso', `Categoria ${category.active ? 'desativada' : 'ativada'}`);
      this.loadCategories();
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível alterar o status');
    }
  }

  openDeleteModal(category: Category): void {
    this.categoryToDelete.set(category);
    this.deleteModalOpen.set(true);
  }

  async confirmDelete(): Promise<void> {
    const cat = this.categoryToDelete();
    if (!cat) return;

    this.deleting.set(true);
    try {
      await this.apiService.deleteCategory(cat.id).toPromise();
      this.notificationService.success('Sucesso', 'Categoria excluída');
      this.deleteModalOpen.set(false);
      this.loadCategories();
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível excluir a categoria');
    } finally {
      this.deleting.set(false);
    }
  }

  openReorderModal(): void {
    this.reorderCategories.set([...this.categories()].sort((a, b) => a.displayOrder - b.displayOrder));
    this.reorderModalOpen.set(true);
  }

  startDrag(index: number, event: MouseEvent): void {
    this.dragIndex.set(index);
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const cats = [...this.reorderCategories()];
    [cats[index], cats[index - 1]] = [cats[index - 1], cats[index]];
    this.reorderCategories.set(cats);
  }

  moveDown(index: number): void {
    if (index === this.reorderCategories().length - 1) return;
    const cats = [...this.reorderCategories()];
    [cats[index], cats[index + 1]] = [cats[index + 1], cats[index]];
    this.reorderCategories.set(cats);
  }

  async saveReorder(): Promise<void> {
    this.savingReorder.set(true);
    try {
      const requests = this.reorderCategories().map((cat, index) => ({
        id: cat.id,
        displayOrder: index
      }));
      await this.apiService.reorderCategories(requests).toPromise();
      this.notificationService.success('Sucesso', 'Ordem atualizada');
      this.reorderModalOpen.set(false);
      this.loadCategories();
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível salvar a ordem');
    } finally {
      this.savingReorder.set(false);
    }
  }
}