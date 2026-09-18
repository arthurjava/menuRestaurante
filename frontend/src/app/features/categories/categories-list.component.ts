import { Component, signal, computed, inject, OnInit, effect, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '@core/services/api.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingService } from '@core/services/loading.service';
import { Category } from '@core/models/category.model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CatFormComponent, CategoryFormData } from '@shared/components/modal/cat-form.component';
import { DelConfirmComponent } from '@shared/components/modal/del-confirm.component';
import { ReorderWrapperComponent, ReorderItem, ReorderModalConfig } from '@shared/components/modal/reorder-wrapper.component';
import { TableComponent, ColumnDef, TableAction } from '@shared/components/table/table.component';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatOptionModule,
    DragDropModule,
    ButtonComponent,
    CatFormComponent,
    DelConfirmComponent,
    ReorderWrapperComponent,
    TableComponent
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Categorias</h1>
          <p class="text-gray-600 mt-1">Gerencie as categorias do cardápio</p>
        </div>
        <app-button
          variant="primary"
          icon="add"
          label="Nova Categoria"
          (clicked)="openCreateModal()">
        </app-button>
      </div>

      <!-- Search & Filters -->
      <mat-card class="p-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Buscar categorias...</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Buscar categorias...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>
          <button mat-stroked-button (click)="toggleFilters()" class="flex items-center gap-2">
            <mat-icon>filter_list</mat-icon>
            Filtros
          </button>
        </div>

        @if (showFilters()) {
          <div class="mt-4 flex flex-col sm:flex-row gap-4">
            <mat-form-field appearance="outline" class="w-full sm:w-48">
              <mat-label>Status</mat-label>
              <mat-select [formControl]="statusFilter">
                @for (opt of statusOptions; track opt.value) {
                  <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        }
      </mat-card>

      <!-- Table -->
      <app-table
        [columns]="columns"
        [data]="filteredCategories()"
        [actions]="tableActions"
        [config]="tableConfig"
        [loading]="loading()"
        [totalItems]="totalItems()"
        [pageIndex]="pageIndex()"
        [pageSize]="pageSize()"
        [sortActive]="sortActive()"
        [sortDirection]="sortDirection()"
        (rowClick)="onRowClick($event)"
        (selectionChange)="onSelectionChange($event)"
        (pageChange)="onPageChange($event)"
        (sortChange)="onSortChange($event)"
        (actionClick)="onActionClick($event)">
      </app-table>

<!-- Create/Edit Modal -->
      <app-cat-form
        [isOpen]="modalOpen()"
        [title]="editingCategory() ? 'Editar Categoria' : 'Nova Categoria'"
        [description]="editingCategory() ? 'Atualize as informações da categoria' : 'Preencha os dados para criar uma nova categoria'"
        [confirmLabel]="editingCategory() ? 'Salvar alterações' : 'Criar categoria'"
        [confirmLoading]="modalLoading()"
        [initialData]="editingCategory() ? {
          name: editingCategory()!.name,
          description: editingCategory()!.description ?? '',
          active: editingCategory()!.active,
          displayOrder: editingCategory()!.displayOrder,
          displayInMenu: true
        } : null"
        [size]="'md'"
        (isOpenChange)="closeModal()"
        (confirmed)="onCategoryConfirmed($event)"
        (cancelled)="closeModal()" />

      <!-- Delete Confirmation Modal -->
      <app-del-confirm
        [isOpen]="deleteModalOpen()"
        [title]="deleteConfirmTitle()"
        [description]="deleteConfirmDescription()"
        [icon]="'warning'"
        [iconColor]="'text-yellow-600'"
        [confirmLabel]="'Excluir'"
        [confirmVariant]="'danger'"
        [confirmLoading]="deleteLoading()"
        [cancelLabel]="'Cancelar'"
        [size]="'sm'"
        (isOpenChange)="closeDeleteModal()"
        (confirmed)="confirmDelete()"
        (cancelled)="closeDeleteModal()">
      </app-del-confirm>

      <!-- Reorder Modal -->
      <app-reorder-list
        [isOpen]="reorderModalOpen()"
        [title]="'Reordenar Categorias'"
        [description]="'Arraste e solte as categorias para definir a ordem de exibição'"
        [confirmLabel]="'Salvar ordem'"
        [confirmLoading]="reorderLoading()"
        [items]="reorderCategories()"
        [config]="reorderConfig()"
        [size]="'lg'"
        (isOpenChange)="closeReorderModal()"
        (confirmed)="onReorderConfirmed($event)"
        (cancelled)="closeReorderModal()">
      </app-reorder-list>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .cdk-drag-preview {
      @apply shadow-lg-custom bg-white;
    }

    .cdk-drag-placeholder {
      @apply opacity-0;
    }

    .cdk-drag-animating {
      @apply transition-transform duration-200;
    }

    :host ::ng-deep .mat-mdc-card {
      @apply shadow-sm border border-gray-100;
    }

    :host ::ng-deep .mat-mdc-form-field {
      @apply w-full;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesListComponent implements OnInit {
  private apiService = inject(ApiService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);

  // State
  loading = signal(false);
  categories = signal<Category[]>([]);
  searchControl = new FormControl('');
  statusFilter = new FormControl<'all' | 'active' | 'inactive'>('all', { nonNullable: true });
  showFilters = signal(false);
  pageIndex = signal(0);
  pageSize = signal(10);
  sortActive = signal('displayOrder');
  sortDirection = signal<'asc' | 'desc'>('asc');
  totalItems = signal(0);

  searchTerm = signal('');

  // Modal state
  modalOpen = signal(false);
  modalLoading = signal(false);
  editingCategory = signal<Category | null>(null);

  // Delete modal
  deleteModalOpen = signal(false);
  deleteLoading = signal(false);
  categoryToDelete = signal<Category | null>(null);

  // Reorder modal
  reorderModalOpen = signal(false);
  reorderLoading = signal(false);
  reorderCategories = signal<Category[]>([]);

  // Table config
  columns: ColumnDef<Category>[] = [
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'description', header: 'Descrição', sortable: false, render: (cat) => cat.description ?? '-' },
    { key: 'displayOrder', header: 'Ordem', sortable: true, align: 'center', width: '80px' },
    { key: 'active', header: 'Status', sortable: true, align: 'center', width: '100px', render: (cat) => cat.active ? 'Ativa' : 'Inativa' }
  ];

  tableActions: TableAction<Category>[] = [
    {
      label: 'Editar',
      icon: 'edit',
      color: 'primary',
      action: (cat) => this.openEditModal(cat)
    },
    {
      label: 'Ativar/Desativar',
      icon: (cat) => cat.active ? 'toggle_on' : 'toggle_off',
      color: (cat) => cat.active ? 'secondary' : 'primary',
      action: (cat) => this.toggleActive(cat)
    },
    {
      label: 'Excluir',
      icon: 'delete',
      color: 'danger',
      action: (cat) => this.openDeleteModal(cat)
    }
  ];

  tableConfig = {
    selectable: true,
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    sorting: true,
    emptyMessage: 'Nenhuma categoria encontrada'
  };

  statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativas' },
    { value: 'inactive', label: 'Inativas' }
  ];

  reorderConfig(): ReorderModalConfig {
    return {
      title: 'Reordenar Categorias',
      description: 'Arraste e solte as categorias para definir a ordem de exibição',
      confirmLabel: 'Salvar ordem',
      emptyMessage: 'Nenhuma categoria para reordenar',
      getItemStatus: (cat: Category) => ({
        label: cat.active ? 'Ativa' : 'Inativa',
        variant: cat.active ? 'success' : 'gray'
      })
    };
  }

  deleteConfirmTitle = computed(() => 'Excluir Categoria');
  deleteConfirmDescription = computed(() => {
    const cat = this.categoryToDelete();
    return cat ? `Tem certeza que deseja excluir a categoria "${cat.name}"? Esta ação não pode ser desfeita.` : '';
  });

  filteredCategories = computed(() => {
    let filtered = this.categories();

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(term) ||
        cat.description?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter.value !== 'all') {
      filtered = filtered.filter(cat => cat.active === (this.statusFilter.value === 'active'));
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadCategories();
    this.statusFilter.valueChanges.subscribe(() => this.pageIndex.set(0));
    this.searchControl.valueChanges.subscribe(value => {
      this.searchTerm.set(value ?? '');
      this.pageIndex.set(0);
    });
  }

  loadCategories(): void {
    this.loading.set(true);
    this.apiService.listCategoriesAdmin().subscribe({
      next: (data: any[]) => {
        this.categories.set(data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl,
          displayOrder: item.displayOrder,
          active: item.active,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        })));
        this.totalItems.set(data.length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  toggleFilters(): void {
    this.showFilters.update(v => !v);
  }

  onRowClick(category: Category): void {
    this.openEditModal(category);
  }

  onSelectionChange(selection: Category[]): void {
    // Handle bulk actions if needed
  }

  onPageChange(event: any): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(event: { active: string; direction: 'asc' | 'desc' }): void {
    this.sortActive.set(event.active);
    this.sortDirection.set(event.direction);
  }

  onActionClick(event: { action: string; row: Category }): void {
    // Handled by individual action
  }

  openCreateModal(): void {
    this.editingCategory.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(category: Category): void {
    this.editingCategory.set(category);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingCategory.set(null);
  }

  onCategoryConfirmed(formData: CategoryFormData): void {
    if (this.modalLoading()) return;

    this.modalLoading.set(true);
    const editing = this.editingCategory();

    const categoryData = {
      name: formData.name,
      description: formData.description,
      active: formData.active,
      displayOrder: formData.displayOrder
    };

    if (editing) {
      this.apiService.updateCategory(editing.id, categoryData).subscribe({
        next: () => {
          this.notification.success('Categoria atualizada com sucesso!');
          this.loadCategories();
          this.closeModal();
          this.modalLoading.set(false);
        },
        error: () => this.modalLoading.set(false)
      });
    } else {
      this.apiService.createCategory(categoryData).subscribe({
        next: () => {
          this.notification.success('Categoria criada com sucesso!');
          this.loadCategories();
          this.closeModal();
          this.modalLoading.set(false);
        },
        error: () => this.modalLoading.set(false)
      });
    }
  }

  openDeleteModal(category: Category): void {
    this.categoryToDelete.set(category);
    this.deleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.categoryToDelete.set(null);
  }

  confirmDelete(): void {
    const category = this.categoryToDelete();
    if (!category || this.deleteLoading()) return;

    this.deleteLoading.set(true);
    this.apiService.deleteCategory(category.id).subscribe({
      next: () => {
        this.notification.success('Categoria excluída com sucesso!');
        this.loadCategories();
        this.closeDeleteModal();
        this.deleteLoading.set(false);
      },
      error: () => this.deleteLoading.set(false)
    });
  }

  toggleActive(category: Category): void {
    this.apiService.toggleCategoryActive(category.id).subscribe({
      next: () => {
        this.notification.success(category.active ? 'Categoria desativada' : 'Categoria ativada');
        this.loadCategories();
      },
      error: () => {}
    });
  }

  openReorderModal(): void {
    this.reorderCategories.set([...this.categories()].sort((a, b) => a.displayOrder - b.displayOrder));
    this.reorderModalOpen.set(true);
  }

  closeReorderModal(): void {
    this.reorderModalOpen.set(false);
  }

  onReorderConfirmed(items: ReorderItem[]): void {
    if (this.reorderLoading()) return;

    this.reorderLoading.set(true);
    const reordered = items.map(cat => ({ id: cat.id, displayOrder: cat.displayOrder }));

    this.apiService.reorderCategories(reordered).subscribe({
      next: () => {
        this.notification.success('Ordem das categorias atualizada!');
        this.loadCategories();
        this.closeReorderModal();
        this.reorderLoading.set(false);
      },
      error: () => this.reorderLoading.set(false)
    });
  }
}