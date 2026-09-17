import { Component, signal, computed, inject, OnInit, effect, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '@core/services/api.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingService } from '@core/services/loading.service';
import { ImageUploadService, UploadedImage } from '@core/services/image-upload.service';
import { Category } from '@core/models/category.model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent } from '@shared/components/select/select.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { TableComponent, ColumnDef, TableAction } from '@shared/components/table/table.component';
import { ImageUploadComponent } from '@shared/components/image-upload/image-upload.component';
import { ImageGalleryComponent, GalleryImage } from '@shared/components/image-gallery/image-gallery.component';

interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  active: boolean;
  displayOrder: number;
  images: UploadedImage[];
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-dishes-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatTabsModule,
    MatSlideToggleModule,
    DragDropModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    BadgeComponent,
    ModalComponent,
    TableComponent,
    ImageUploadComponent,
    ImageGalleryComponent
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Pratos</h1>
          <p class="text-gray-600 mt-1">Gerencie os pratos do cardápio</p>
        </div>
        <app-button
          variant="primary"
          icon="add"
          label="Novo Prato"
          (clicked)="openCreateModal()">
        </app-button>
      </div>

      <!-- Search & Filters -->
      <mat-card class="p-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <app-input
            placeholder="Buscar pratos..."
            prefixIcon="search"
            [value]="searchTerm()"
            (valueChange)="onSearch($event)"
            class="flex-1">
          </app-input>

          <app-select
            [options]="categoryOptions()"
            placeholder="Categoria"
            [value]="categoryFilter()"
            (valueChange)="onCategoryFilterChange($event)"
            class="w-full sm:w-56">
          </app-select>

          <app-select
            [options]="statusOptions"
            placeholder="Status"
            [value]="statusFilter()"
            (valueChange)="onStatusFilterChange($event)"
            class="w-full sm:w-40">
          </app-select>

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
              [options]="sortOptions"
              placeholder="Ordenar por"
              [value]="sortBy()"
              (valueChange)="onSortByChange($event)"
              class="w-full sm:w-56">
            </app-select>
          </div>
        }
      </mat-card>

      <!-- Table -->
      <app-table
        [columns]="columns"
        [data]="filteredDishes()"
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
        [title]="editingDish() ? 'Editar Prato' : 'Novo Prato'"
        [description]="editingDish() ? 'Atualize as informações do prato' : 'Preencha os dados para criar um novo prato'"
        [confirmLabel]="editingDish() ? 'Salvar alterações' : 'Criar prato'"
        [confirmLoading]="modalLoading()"
        [size]="'xl'"
        (isOpenChange)="closeModal()"
        (confirmed)="saveDish()"
        (cancelled)="closeModal()">
        <form [formGroup]="dishForm" class="space-y-4">
          <mat-tab-group animationDuration="200ms" class="w-full">
            <!-- Basic Info Tab -->
            <mat-tab label="Informações Básicas">
              <div class="p-4 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <app-input
                    formControlName="name"
                    label="Nome do Prato *"
                    type="text"
                    placeholder="Ex: Salmão Grelhado"
                    [error]="nameError()">
                  </app-input>

                  <app-select
                    formControlName="categoryId"
                    label="Categoria *"
                    [options]="categoryOptions()"
                    placeholder="Selecione a categoria"
                    [error]="categoryError()">
                  </app-select>
                </div>

                <app-input
                  formControlName="description"
                  label="Descrição"
                  type="textarea"
                  placeholder="Descreva o prato, ingredientes, modo de preparo..."
                  [error]="descriptionError()"
                  class="min-h-[100px]">
                </app-input>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="label">Preço (R$) *</label>
                    <input
                      type="number"
                      formControlName="price"
                      class="input"
                      step="0.01"
                      min="0"
                      placeholder="0,00" />
                    @if (priceError()) {
                      <p class="text-sm text-red-600 mt-1">{{ priceError() }}</p>
                    }
                  </div>

                  <div>
                    <label class="label">Ordem de exibição</label>
                    <input
                      type="number"
                      formControlName="displayOrder"
                      class="input"
                      min="0"
                      step="1" />
                  </div>

                  <div class="flex items-end">
                    <label class="flex items-center gap-2 cursor-pointer w-full">
                      <mat-slide-toggle formControlName="active" class="w-auto"></mat-slide-toggle>
                      <span class="text-sm text-gray-600">Prato ativo</span>
                    </label>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Images Tab -->
            <mat-tab label="Imagens">
              <div class="p-4">
                <app-image-upload
                  [dishId]="editingDish()?.id ?? ''"
                  [maxFiles]="5"
                  [maxFileSizeMB]="5"
                  [existingImages]="editingDish()?.images ?? []"
                  (imagesChange)="onImagesChange($event)"
                  (uploadComplete)="onImagesUploadComplete($event)"
                  (uploadError)="onImageError($event)">
                </app-image-upload>
              </div>
            </mat-tab>
          </mat-tab-group>
        </form>
      </app-modal>

      <!-- Delete Confirmation Modal -->
      <app-modal
        [isOpen]="deleteModalOpen()"
        title="Excluir Prato"
        [description]="'Tem certeza que deseja excluir o prato \"' + dishToDelete()?.name + '\"? Esta ação não pode ser desfeita.'"
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
        title="Reordenar Pratos"
        description="Arraste e solte os pratos para definir a ordem de exibição"
        confirmLabel="Salvar ordem"
        [confirmLoading]="reorderLoading()"
        size="lg"
        (isOpenChange)="closeReorderModal()"
        (confirmed)="saveReorder()"
        (cancelled)="closeReorderModal()">
        <div cdkDropList (cdkDropListDropped)="onReorderDrop($event)" class="space-y-2 max-h-96 overflow-y-auto">
          @for (dish of reorderDishes(); track dish.id; let i = $index) {
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cdk-drag">
              <mat-icon class="text-gray-400 cursor-grab">drag_indicator</mat-icon>
              <span class="font-medium">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ dish.name }}</p>
                <p class="text-sm text-gray-500 truncate">{{ dish.categoryName }}</p>
              </div>
              <app-badge
                [label]="dish.active ? 'Ativo' : 'Inativo'"
                [variant]="dish.active ? 'success' : 'gray'"
                size="sm">
              </app-badge>
            </div>
          }
        </div>
      </app-modal>

      <!-- Image Gallery Modal -->
      <app-modal
        [isOpen]="galleryModalOpen()"
        [title]="'Imagens de ' + galleryDish()?.name"
        [confirmLabel]="'Fechar'"
        [showFooter]="true"
        size="xl"
        (isOpenChange)="closeGalleryModal()"
        (confirmed)="closeGalleryModal()"
        (cancelled)="closeGalleryModal()">
        <app-image-gallery
          [images]="galleryImages()"
          (imageSelected)="onGalleryImageSelect($event)">
        </app-image-gallery>
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

    :host ::ng-deep .mat-mdc-tab-group {
      @apply w-full;
    }

    :host ::ng-deep .mat-mdc-tab-body-wrapper {
      @apply h-auto;
    }

    @media (max-width: 768px) {
      :host ::ng-deep .mat-mdc-tab-label {
        @apply px-2 py-2 text-sm;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DishesListComponent implements OnInit {
  private apiService = inject(ApiService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);
  private imageUploadService = inject(ImageUploadService);
  private fb = inject(FormBuilder);

  // State
  loading = signal(false);
  dishes = signal<Dish[]>([]);
  categories = signal<Category[]>([]);
  searchTerm = signal('');
  categoryFilter = signal<string>('');
  statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  showFilters = signal(false);
  sortBy = signal<'name' | 'price' | 'category' | 'displayOrder'>('displayOrder');
  pageIndex = signal(0);
  pageSize = signal(10);
  sortActive = signal('displayOrder');
  sortDirection = signal<'asc' | 'desc'>('asc');
  totalItems = signal(0);

  // Modal state
  modalOpen = signal(false);
  modalLoading = signal(false);
  editingDish = signal<Dish | null>(null);
  dishFormImages = signal<UploadedImage[]>([]);

  // Delete modal
  deleteModalOpen = signal(false);
  deleteLoading = signal(false);
  dishToDelete = signal<Dish | null>(null);

  // Reorder modal
  reorderModalOpen = signal(false);
  reorderLoading = signal(false);
  reorderDishes = signal<Dish[]>([]);

  // Gallery modal
  galleryModalOpen = signal(false);
  galleryDish = signal<Dish | null>(null);
  galleryImages = signal<GalleryImage[]>([]);

  // Form
  dishForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(1000)]],
    price: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', [Validators.required]],
    active: [true],
    displayOrder: [0, [Validators.min(0)]]
  });

  // Table config
  columns: ColumnDef<Dish>[] = [
    { key: 'name', header: 'Prato', sortable: true, render: (dish) => dish.name },
    { key: 'categoryName', header: 'Categoria', sortable: true },
    { key: 'price', header: 'Preço', sortable: true, align: 'right', width: '100px', render: (dish) => `R$ ${dish.price.toFixed(2).replace('.', ',')}` },
    { key: 'displayOrder', header: 'Ordem', sortable: true, align: 'center', width: '80px' },
    { key: 'active', header: 'Status', sortable: true, align: 'center', width: '100px', render: (dish) => dish.active ? 'Ativo' : 'Inativo' },
    { key: 'images', header: 'Imagens', sortable: false, align: 'center', width: '100px', render: (dish) => `${dish.images?.length ?? 0}` }
  ];

  tableActions: TableAction<Dish>[] = [
    {
      label: 'Ver imagens',
      icon: 'photo_library',
      color: 'primary',
      action: (dish) => this.openGallery(dish)
    },
    {
      label: 'Editar',
      icon: 'edit',
      color: 'primary',
      action: (dish) => this.openEditModal(dish)
    },
    {
      label: 'Ativar/Desativar',
      icon: (dish) => dish.active ? 'toggle_on' : 'toggle_off',
      color: (dish) => dish.active ? 'secondary' : 'primary',
      action: (dish) => this.toggleActive(dish)
    },
    {
      label: 'Excluir',
      icon: 'delete',
      color: 'danger',
      action: (dish) => this.openDeleteModal(dish)
    }
  ];

  tableConfig = {
    selectable: true,
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    sorting: true,
    emptyMessage: 'Nenhum prato encontrado'
  };

  statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'inactive', label: 'Inativos' }
  ];

  sortOptions = [
    { value: 'displayOrder', label: 'Ordem de exibição' },
    { value: 'name', label: 'Nome (A-Z)' },
    { value: 'price', label: 'Preço' },
    { value: 'category', label: 'Categoria' }
  ];

  filteredDishes = computed(() => {
    let filtered = this.dishes();

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(term) ||
        dish.description?.toLowerCase().includes(term) ||
        dish.categoryName?.toLowerCase().includes(term)
      );
    }

    if (this.categoryFilter()) {
      filtered = filtered.filter(dish => dish.categoryId === this.categoryFilter());
    }

    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(dish => dish.active === (this.statusFilter() === 'active'));
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy()) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'category':
          comparison = (a.categoryName ?? '').localeCompare(b.categoryName ?? '');
          break;
        case 'displayOrder':
        default:
          comparison = a.displayOrder - b.displayOrder;
          break;
      }
      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });

    return filtered;
  });

  categoryOptions = computed(() => [
    { value: '', label: 'Todas as categorias' },
    ...this.categories().filter(c => c.active).map(c => ({ value: c.id, label: c.name }))
  ]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    
    // Load categories first
    this.apiService.listCategories().subscribe({
      next: (cats: any[]) => {
        this.categories.set(cats.map(c => ({ id: c.id, name: c.name, description: c.description, imageUrl: c.imageUrl, displayOrder: c.displayOrder, active: c.active, createdAt: c.createdAt, updatedAt: c.updatedAt })));
        this.loadDishes();
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadDishes(): void {
    this.apiService.listDishesAdmin({ active: this.statusFilter() === 'all' ? undefined : this.statusFilter() === 'active' }).subscribe({
      next: (data: any[]) => {
        this.dishes.set(data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: item.categoryId,
          categoryName: item.category?.name,
          active: item.active,
          displayOrder: item.displayOrder,
          images: item.images ?? [],
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

  onCategoryFilterChange(value: string): void {
    this.categoryFilter.set(value);
    this.pageIndex.set(0);
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter.set(value as 'all' | 'active' | 'inactive');
    this.pageIndex.set(0);
    this.loadDishes();
  }

  onSortByChange(value: string): void {
    this.sortBy.set(value as any);
  }

  toggleFilters(): void {
    this.showFilters.update(v => !v);
  }

  onRowClick(dish: Dish): void {
    this.openEditModal(dish);
  }

  onSelectionChange(selection: Dish[]): void {
    // Handle bulk actions
  }

  onPageChange(event: any): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(event: { active: string; direction: 'asc' | 'desc' }): void {
    this.sortActive.set(event.active);
    this.sortDirection.set(event.direction);
  }

  onActionClick(event: { action: string; row: Dish }): void {
    // Handled by individual action
  }

  openCreateModal(): void {
    this.editingDish.set(null);
    this.dishFormImages.set([]);
    this.dishForm.reset({ name: '', description: '', price: 0, categoryId: '', active: true, displayOrder: 0 });
    this.modalOpen.set(true);
  }

  openEditModal(dish: Dish): void {
    this.editingDish.set(dish);
    this.dishFormImages.set(dish.images ?? []);
    this.dishForm.patchValue({
      name: dish.name,
      description: dish.description ?? '',
      price: dish.price,
      categoryId: dish.categoryId,
      active: dish.active,
      displayOrder: dish.displayOrder
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingDish.set(null);
    this.dishFormImages.set([]);
    this.dishForm.reset({ name: '', description: '', price: 0, categoryId: '', active: true, displayOrder: 0 });
  }

  saveDish(): void {
    if (this.dishForm.invalid || this.modalLoading()) return;

    this.modalLoading.set(true);
    const formValue = this.dishForm.value;
    const editing = this.editingDish();

    const dishData = {
      name: formValue.name,
      description: formValue.description,
      price: formValue.price,
      categoryId: formValue.categoryId,
      active: formValue.active,
      displayOrder: formValue.displayOrder
    };

    if (editing) {
      this.apiService.updateDish(editing.id, dishData).subscribe({
        next: () => {
          this.notification.success('Prato atualizado com sucesso!');
          this.loadDishes();
          this.closeModal();
          this.modalLoading.set(false);
        },
        error: () => this.modalLoading.set(false)
      });
    } else {
      this.apiService.createDish(dishData).subscribe({
        next: (newDish: any) => {
          this.notification.success('Prato criado com sucesso!');
          this.loadDishes();
          this.closeModal();
          this.modalLoading.set(false);
        },
        error: () => this.modalLoading.set(false)
      });
    }
  }

  openDeleteModal(dish: Dish): void {
    this.dishToDelete.set(dish);
    this.deleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.dishToDelete.set(null);
  }

  confirmDelete(): void {
    const dish = this.dishToDelete();
    if (!dish || this.deleteLoading()) return;

    this.deleteLoading.set(true);
    this.apiService.deleteDish(dish.id).subscribe({
      next: () => {
        this.notification.success('Prato excluído com sucesso!');
        this.loadDishes();
        this.closeDeleteModal();
        this.deleteLoading.set(false);
      },
      error: () => this.deleteLoading.set(false)
    });
  }

  toggleActive(dish: Dish): void {
    this.apiService.toggleDishActive(dish.id).subscribe({
      next: () => {
        this.notification.success(dish.active ? 'Prato desativado' : 'Prato ativado');
        this.loadDishes();
      },
      error: () => {}
    });
  }

  openReorderModal(): void {
    this.reorderDishes.set([...this.dishes()].sort((a, b) => a.displayOrder - b.displayOrder));
    this.reorderModalOpen.set(true);
  }

  closeReorderModal(): void {
    this.reorderModalOpen.set(false);
  }

  onReorderDrop(event: CdkDragDrop<Dish[]>): void {
    this.reorderDishes.update(dishes => {
      const updated = [...dishes];
      moveItemInArray(updated, event.previousIndex, event.currentIndex);
      return updated.map((dish, index) => ({ ...dish, displayOrder: index }));
    });
  }

  saveReorder(): void {
    if (this.reorderLoading()) return;

    this.reorderLoading.set(true);
    const reordered = this.reorderDishes().map(dish => ({ id: dish.id, displayOrder: dish.displayOrder }));

    this.apiService.reorderDishes(reordered).subscribe({
      next: () => {
        this.notification.success('Ordem dos pratos atualizada!');
        this.loadDishes();
        this.closeReorderModal();
        this.reorderLoading.set(false);
      },
      error: () => this.reorderLoading.set(false)
    });
  }

  onImagesChange(images: any[]): void {
    this.dishFormImages.set(images);
  }

  onImagesUploadComplete(images: UploadedImage[]): void {
    this.dishFormImages.update(current => [...current, ...images]);
  }

  onImageError(error: string): void {
    this.notification.error(error);
  }

  openGallery(dish: Dish): void {
    this.galleryDish.set(dish);
    this.galleryImages.set((dish.images ?? []).map((img, index) => ({
      id: img.id,
      url: img.url,
      thumbnailUrl: img.url,
      alt: `${dish.name} - Imagem ${index + 1}`,
      isMain: img.isMain
    })));
    this.galleryModalOpen.set(true);
  }

  closeGalleryModal(): void {
    this.galleryModalOpen.set(false);
    this.galleryDish.set(null);
    this.galleryImages.set([]);
  }

  onGalleryImageSelect(index: number): void {
    // Handle image selection if needed
  }

  // Validation helpers
  nameError = computed(() => {
    const control = this.dishForm.get('name');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Nome é obrigatório';
      if (control.errors['maxlength']) return 'Nome deve ter no máximo 100 caracteres';
    }
    return '';
  });

  descriptionError = computed(() => {
    const control = this.dishForm.get('description');
    if (control?.touched && control?.errors?.['maxlength']) {
      return 'Descrição deve ter no máximo 1000 caracteres';
    }
    return '';
  });

  priceError = computed(() => {
    const control = this.dishForm.get('price');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Preço é obrigatório';
      if (control.errors['min']) return 'Preço deve ser maior ou igual a zero';
    }
    return '';
  });

  categoryError = computed(() => {
    const control = this.dishForm.get('categoryId');
    if (control?.touched && control?.errors?.['required']) {
      return 'Categoria é obrigatória';
    }
    return '';
  });
}