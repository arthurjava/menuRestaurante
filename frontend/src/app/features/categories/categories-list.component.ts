import { Component, signal, computed, inject, OnInit, effect, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '@core/services/api.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingService } from '@core/services/loading.service';
import { Category } from '@core/models/category.model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
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
    MatDialogModule,
    DragDropModule,
    ButtonComponent,
    InputComponent,
    BadgeComponent,
    ModalComponent,
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
          <app-input
            placeholder="Buscar categorias..."
            prefixIcon="search"
            [value]="searchTerm()"
            (valueChange)="onSearch($event)"
            class="flex-1">
          </app-input>
          <app-button
            variant="outline"
            icon="filter_list"
            label="Filtros"
            (clicked)="toggleFilters()">
          </app-button>
        </div>

        @if (showFilters()) {
          <div class="mt-4 flex flex-col sm:flex-row gap-4">
            <app-select
              [options]="statusOptions"
              placeholder="Status"
              [value]="statusFilter()"
              (valueChange)="onStatusFilterChange($event)"
              class="w-full sm:w-48">
            </app-select>
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
      <app-modal
        [isOpen]="modalOpen()"
        [title]="editingCategory() ? 'Editar Categoria' : 'Nova Categoria'"
        [description]="editingCategory() ? 'Atualize as informações da categoria' : 'Preencha os dados para criar uma nova categoria'"
        [confirmLabel]="editingCategory() ? 'Salvar alterações' : 'Criar categoria'"
        [confirmLoading]="modalLoading()"
        [size]="'md'"
        (isOpenChange)="closeModal()"
        (confirmed)="saveCategory()"
        (cancelled)="closeModal()">
        <form [formGroup]="categoryForm" class="space-y-4">
          <app-input
            formControlName="name"
            label="Nome"
            type="text"
            placeholder="Ex: Pratos Principais"
            [error]="nameError()">
          </app-input>

          <app-input
            formControlName="description"
            label="Descrição"
            type="text"
            placeholder="Descrição da categoria"
            [error]="descriptionError()">
          </app-input>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer flex-1">
              <input type="checkbox" formControlName="active" class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500">
              <span class="text-sm text-gray-600">Categoria ativa</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer flex-1">
              <input type="checkbox" formControlName="displayOrder" class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500">
              <span class="text-sm text-gray-600">Exibir no cardápio público</span>
            </label>
          </div>

          <div class="mt-4">
            <label class="label">Ordem de exibição</label>
            <input
              type="number"
              formControlName="displayOrder"
              class="input w-24"
              min="0"
              step="1" />
          </div>
        </form>
      </app-modal>

      <!-- Delete Confirmation Modal -->
      <app-modal
        [isOpen]="deleteModalOpen()"
        title="Excluir Categoria"
        [description]="'Tem certeza que deseja excluir a categoria \"' + categoryToDelete()?.name + '\"? Esta ação não pode ser desfeita.'"
        icon="warning"
        iconColor="text-yellow-600"
        confirmLabel="Excluir"
        confirmVariant="danger"
        [confirmLoading]="deleteLoading()"
        size="sm"
        (isOpenChange)="closeDeleteModal()"
        (confirmed)="confirmDelete()"
        (cancelled)="closeDeleteModal()">
      </app-modal>

      <!-- Reorder Modal -->
      <app-modal
        [isOpen]="reorderModalOpen()"
        title="Reordenar Categorias"
        description="Arraste e solte as categorias para definir a ordem de exibição"
        confirmLabel="Salvar ordem"
        [confirmLoading]="reorderLoading()"
        size="lg"
        (isOpenChange)="closeReorderModal()"
        (confirmed)="saveReorder()"
        (cancelled)="closeReorderModal()">
        <div cdkDropList (cdkDropListDropped)="onReorderDrop($event)" class="space-y-2">
          @for (cat of reorderCategories(); track cat.id; let i = $index) {
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cdk-drag">
              <mat-icon class="text-gray-400 cursor-grab">drag_indicator</mat-icon>
              <span class="font-medium">{{ i + 1 }}</span>
              <span class="flex-1">{{ cat.name }}</span>
              <app-badge
                [label]="cat.active ? 'Ativa' : 'Inativa'"
                [variant]="cat.active ? 'success' : 'gray'"
                size="sm">
              </app-badge>
            </div>
          }
        </div>
      </app-modal>
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
  private fb = inject(FormBuilder);

  // State
  loading = signal(false);
  categories = signal<Category[]>([]);
  searchTerm = signal('');
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  showFilters = signal(false);
  pageIndex = signal(0);
  pageSize = signal(10);
  sortActive = signal('displayOrder');
  sortDirection = signal<'asc' | 'desc'>('asc');
  totalItems = signal(0);

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

  // Form
  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    active: [true],
    displayOrder: [0, [Validators.min(0)]]
  });

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

  filteredCategories = computed(() => {
    let filtered = this.categories();

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(term) ||
        cat.description?.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(cat => cat.active === (this.statusFilter() === 'active'));
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadCategories();
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

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pageIndex.set(0);
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter.set(value as 'all' | 'active' | 'inactive');
    this.pageIndex.set(0);
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
    this.categoryForm.reset({ name: '', description: '', active: true, displayOrder: 0 });
    this.modalOpen.set(true);
  }

  openEditModal(category: Category): void {
    this.editingCategory.set(category);
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description ?? '',
      active: category.active,
      displayOrder: category.displayOrder
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingCategory.set(null);
    this.categoryForm.reset({ name: '', description: '', active: true, displayOrder: 0 });
  }

  saveCategory(): void {
    if (this.categoryForm.invalid || this.modalLoading()) return;

    this.modalLoading.set(true);
    const formValue = this.categoryForm.value;
    const editing = this.editingCategory();

    const categoryData = {
      name: formValue.name,
      description: formValue.description,
      active: formValue.active,
      displayOrder: formValue.displayOrder
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

  onReorderDrop(event: CdkDragDrop<Category[]>): void {
    this.reorderCategories.update(cats => {
      const updated = [...cats];
      moveItemInArray(updated, event.previousIndex, event.currentIndex);
      return updated.map((cat, index) => ({ ...cat, displayOrder: index }));
    });
  }

  saveReorder(): void {
    if (this.reorderLoading()) return;

    this.reorderLoading.set(true);
    const reordered = this.reorderCategories().map(cat => ({ id: cat.id, displayOrder: cat.displayOrder }));

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

  nameError = computed(() => {
    const control = this.categoryForm.get('name');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Nome é obrigatório';
      if (control.errors['maxlength']) return 'Nome deve ter no máximo 100 caracteres';
    }
    return '';
  });

  descriptionError = computed(() => {
    const control = this.categoryForm.get('description');
    if (control?.touched && control?.errors?.['maxlength']) {
      return 'Descrição deve ter no máximo 500 caracteres';
    }
    return '';
  });
}