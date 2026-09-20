import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  effect,
  viewChild,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { MatPaginatorModule, MatPaginator } from "@angular/material/paginator";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTabsModule } from "@angular/material/tabs";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { SelectionModel } from "@angular/cdk/collections";
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { ApiService } from "@core/services/api.service";
import { NotificationService } from "@core/services/notification.service";
import { LoadingService } from "@core/services/loading.service";
import {
  ImageUploadService,
  UploadedImage,
} from "@core/services/image-upload.service";
import { Category } from "@core/models/category.model";
import {
  TableComponent,
  ColumnDef,
  TableAction,
} from "@shared/components/table/table.component";
import {
  ImageGalleryComponent,
  GalleryImage,
} from "@shared/components/image-gallery/image-gallery.component";
import {
  DishFormComponent,
  DishFormData,
} from "@shared/components/modal/dish-form.component";
import { DelConfirmComponent } from "@shared/components/modal/del-confirm.component";
import {
  ReorderWrapperComponent,
  ReorderItem,
} from "@shared/components/modal/reorder-wrapper.component";

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
  selector: "app-dishes-list",
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
    MatTabsModule,
    MatSlideToggleModule,
    DragDropModule,
    TableComponent,
    ImageGalleryComponent,
    DishFormComponent,
    DelConfirmComponent,
    ReorderWrapperComponent,
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Pratos</h1>
          <p class="text-gray-600 mt-1">Gerencie os pratos do cardápio</p>
        </div>
        <button
          mat-flat-button
          color="primary"
          (click)="openCreateModal()"
          class="flex items-center gap-2"
        >
          <mat-icon>add</mat-icon>
          Novo Prato
        </button>
      </div>

      <!-- Search & Filters -->
      <mat-card class="p-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Buscar pratos...</mat-label>
            <input
              matInput
              [formControl]="searchControl"
              placeholder="Buscar pratos..."
            />
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full sm:w-56">
            <mat-label>Categoria</mat-label>
            <mat-select
              [formControl]="categoryFilterControl"
              [compareWith]="compareById"
            >
              @for (opt of categoryOptions(); track opt.value) {
                <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full sm:w-40">
            <mat-label>Status</mat-label>
            <mat-select [formControl]="statusFilterControl">
              @for (opt of statusOptions; track opt.value) {
                <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <button
            mat-stroked-button
            (click)="toggleFilters()"
            class="flex items-center gap-2"
          >
            <mat-icon>filter_list</mat-icon>
            Filtros
          </button>
        </div>

        @if (showFilters()) {
          <div class="mt-4 flex flex-col sm:flex-row gap-4">
            <mat-form-field appearance="outline" class="w-full sm:w-56">
              <mat-label>Ordenar por</mat-label>
              <mat-select [formControl]="sortByControl">
                @for (opt of sortOptions; track opt.value) {
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
        (actionClick)="onActionClick($event)"
      >
      </app-table>

      <!-- Create/Edit Dish Modal -->
      <app-dish-form
        [isOpen]="modalOpen()"
        [title]="editingDish() ? 'Editar Prato' : 'Novo Prato'"
        [description]="
          editingDish()
            ? 'Atualize as informações do prato'
            : 'Preencha os dados para criar um novo prato'
        "
        [confirmLabel]="editingDish() ? 'Salvar alterações' : 'Criar prato'"
        [confirmLoading]="modalLoading()"
        [categoryOptions]="categoryOptions()"
        [initialData]="
          editingDish()
            ? {
                name: editingDish()!.name,
                description: editingDish()!.description ?? '',
                price: editingDish()!.price,
                categoryId: editingDish()!.categoryId,
                active: editingDish()!.active,
                displayOrder: editingDish()!.displayOrder,
              }
            : null
        "
        [existingImages]="editingDish()?.images ?? []"
        [editingDishId]="editingDish()?.id ?? ''"
        [size]="'xl'"
        (isOpenChange)="modalOpen.set($event)"
        (confirmed)="onDishFormConfirmed($event)"
        (cancelled)="closeModal()"
        (uploadError)="onImageError($event)"
      >
      </app-dish-form>

      <!-- Delete Confirmation Modal -->
      <app-del-confirm
        [isOpen]="deleteModalOpen()"
        title="Excluir Prato"
        [description]="deleteDescription()"
        icon="warning"
        iconColor="text-yellow-600"
        confirmLabel="Excluir"
        confirmVariant="danger"
        [confirmLoading]="deleteLoading()"
        size="sm"
        (isOpenChange)="deleteModalOpen.set($event)"
        (confirmed)="confirmDelete()"
        (cancelled)="closeDeleteModal()"
      >
      </app-del-confirm>

      <!-- Reorder Modal -->
      <app-reorder-list
        [isOpen]="reorderModalOpen()"
        title="Reordenar Pratos"
        description="Arraste e solte os pratos para definir a ordem de exibição"
        confirmLabel="Salvar ordem"
        [confirmLoading]="reorderLoading()"
        [items]="reorderDishes()"
        [config]="reorderConfig()"
        size="lg"
        (isOpenChange)="reorderModalOpen.set($event)"
        (confirmed)="onReorderConfirmed($event)"
        (cancelled)="closeReorderModal()"
      >
      </app-reorder-list>

      <!-- Image Gallery Modal -->
      <app-del-confirm
        [isOpen]="galleryModalOpen()"
        [title]="galleryTitle()"
        description=" "
        icon="photo_library"
        iconColor="text-indigo-600"
        confirmLabel="Fechar"
        confirmVariant="secondary"
        [showFooter]="true"
        size="xl"
        (isOpenChange)="galleryModalOpen.set($event)"
        (confirmed)="closeGalleryModal()"
        (cancelled)="closeGalleryModal()"
      >
        <app-image-gallery
          [images]="galleryImages()"
          (imageSelected)="onGalleryImageSelect($event)"
        >
        </app-image-gallery>
      </app-del-confirm>
    </div>
  `,
  styles: [
    `
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishesListComponent implements OnInit {
  private apiService = inject(ApiService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);

  // State
  loading = signal(false);
  dishes = signal<Dish[]>([]);
  categories = signal<Category[]>([]);
  showFilters = signal(false);
  pageIndex = signal(0);
  pageSize = signal(10);
  sortActive = signal("displayOrder");
  sortDirection = signal<"asc" | "desc">("asc");
  totalItems = signal(0);

  // Modal state
  modalOpen = signal(false);
  modalLoading = signal(false);
  editingDish = signal<Dish | null>(null);

  // Delete modal
  deleteModalOpen = signal(false);
  deleteLoading = signal(false);
  dishToDelete = signal<Dish | null>(null);

  // Reorder modal
  reorderModalOpen = signal(false);
  reorderLoading = signal(false);
  reorderDishes = signal<ReorderItem[]>([]);

  // Gallery modal
  galleryModalOpen = signal(false);
  galleryDish = signal<Dish | null>(null);
  galleryImages = signal<GalleryImage[]>([]);

  // Table config
  columns: ColumnDef<Dish>[] = [
    {
      key: "name",
      header: "Prato",
      sortable: true,
      render: (dish) => dish.name,
    },
    { key: "categoryName", header: "Categoria", sortable: true },
    {
      key: "price",
      header: "Preço",
      sortable: true,
      align: "right",
      width: "100px",
      render: (dish) => `R$ ${dish.price.toFixed(2).replace(".", ",")}`,
    },
    {
      key: "displayOrder",
      header: "Ordem",
      sortable: true,
      align: "center",
      width: "80px",
    },
    {
      key: "active",
      header: "Status",
      sortable: true,
      align: "center",
      width: "100px",
      render: (dish) => (dish.active ? "Ativo" : "Inativo"),
    },
    {
      key: "images",
      header: "Imagens",
      sortable: false,
      align: "center",
      width: "100px",
      render: (dish) => `${dish.images?.length ?? 0}`,
    },
  ];

  tableActions: TableAction<Dish>[] = [
    {
      label: "Ver imagens",
      icon: "photo_library",
      color: "primary",
      action: (dish) => this.openGallery(dish),
    },
    {
      label: "Editar",
      icon: "edit",
      color: "primary",
      action: (dish) => this.openEditModal(dish),
    },
    {
      label: "Ativar/Desativar",
      icon: (dish) => (dish.active ? "toggle_on" : "toggle_off"),
      color: (dish) => (dish.active ? "secondary" : "primary"),
      action: (dish) => this.toggleActive(dish),
    },
    {
      label: "Excluir",
      icon: "delete",
      color: "danger",
      action: (dish) => this.openDeleteModal(dish),
    },
  ];

  tableConfig = {
    selectable: true,
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    sorting: true,
    emptyMessage: "Nenhum prato encontrado",
  };

  statusOptions = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Ativos" },
    { value: "inactive", label: "Inativos" },
  ];

  sortOptions = [
    { value: "displayOrder", label: "Ordem de exibição" },
    { value: "name", label: "Nome (A-Z)" },
    { value: "price", label: "Preço" },
    { value: "category", label: "Categoria" },
  ];

  filteredDishes = computed(() => {
    let filtered = this.dishes();

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(
        (dish) =>
          dish.name.toLowerCase().includes(term) ||
          dish.description?.toLowerCase().includes(term) ||
          dish.categoryName?.toLowerCase().includes(term),
      );
    }

    if (this.categoryFilter()) {
      filtered = filtered.filter(
        (dish) => dish.categoryId === this.categoryFilter(),
      );
    }

    if (this.statusFilter() !== "all") {
      filtered = filtered.filter(
        (dish) => dish.active === (this.statusFilter() === "active"),
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy()) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "category":
          comparison = (a.categoryName ?? "").localeCompare(
            b.categoryName ?? "",
          );
          break;
        case "displayOrder":
        default:
          comparison = a.displayOrder - b.displayOrder;
          break;
      }
      return this.sortDirection() === "asc" ? comparison : -comparison;
    });

    return filtered;
  });

  categoryOptions = computed(() => [
    { value: "", label: "Todas as categorias" },
    ...this.categories()
      .filter((c) => c.active)
      .map((c) => ({ value: c.id, label: c.name })),
  ]);

  // FormControls for filters (reactive)
  searchControl = new FormControl("");
  categoryFilterControl = new FormControl("");
  statusFilterControl = new FormControl<"all" | "active" | "inactive">("all");
  sortByControl = new FormControl<
    "displayOrder" | "name" | "price" | "category"
  >("displayOrder");

  // Derived signals from FormControls
  searchTerm = signal("");
  categoryFilter = signal("");
  statusFilter = signal<"all" | "active" | "inactive">("all");
  sortBy = signal<"displayOrder" | "name" | "price" | "category">(
    "displayOrder",
  );

  ngOnInit(): void {
    this.setupFilterSubscriptions();
    this.loadData();
  }

  private setupFilterSubscriptions(): void {
    this.searchControl.valueChanges.subscribe((value) => {
      this.searchTerm.set(value ?? "");
      this.pageIndex.set(0);
    });
    this.categoryFilterControl.valueChanges.subscribe((value) => {
      this.categoryFilter.set(value ?? "");
      this.pageIndex.set(0);
    });
    this.statusFilterControl.valueChanges.subscribe((value) => {
      this.statusFilter.set((value as "all" | "active" | "inactive") ?? "all");
      this.pageIndex.set(0);
      this.loadDishes();
    });
    this.sortByControl.valueChanges.subscribe((value) => {
      this.sortBy.set((value as any) ?? "displayOrder");
    });
  }

  loadData(): void {
    this.loading.set(true);

    // Load categories first
    this.apiService.listCategories().subscribe({
      next: (cats: any[]) => {
        this.categories.set(
          cats.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            imageUrl: c.imageUrl,
            displayOrder: c.displayOrder,
            active: c.active,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          })),
        );
        this.loadDishes();
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadDishes(): void {
    this.apiService
      .listDishesAdmin({
        active:
          this.statusFilter() === "all"
            ? undefined
            : this.statusFilter() === "active",
      })
      .subscribe({
        next: (data: any[]) => {
          this.dishes.set(
            data.map((item) => ({
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
              updatedAt: item.updatedAt,
            })),
          );
          this.totalItems.set(data.length);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  toggleFilters(): void {
    this.showFilters.update((v) => !v);
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

  onSortChange(event: { active: string; direction: "asc" | "desc" }): void {
    this.sortActive.set(event.active);
    this.sortDirection.set(event.direction);
  }

  onActionClick(event: { action: string; row: Dish }): void {
    // Handled by individual action
  }

  openCreateModal(): void {
    this.editingDish.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(dish: Dish): void {
    this.editingDish.set(dish);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingDish.set(null);
  }

  onDishFormConfirmed(formData: DishFormData): void {
    if (this.modalLoading()) return;

    this.modalLoading.set(true);
    const editing = this.editingDish();

    const dishData = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      categoryId: formData.categoryId,
      active: formData.active,
      displayOrder: formData.displayOrder,
    };

    if (editing) {
      this.apiService.updateDish(editing.id, dishData).subscribe({
        next: () => {
          this.notification.success("Prato atualizado com sucesso!");
          this.loadDishes();
          this.closeModal();
          this.modalLoading.set(false);
        },
        error: () => this.modalLoading.set(false),
      });
    } else {
      this.apiService.createDish(dishData).subscribe({
        next: () => {
          this.notification.success("Prato criado com sucesso!");
          this.loadDishes();
          this.closeModal();
          this.modalLoading.set(false);
        },
        error: () => this.modalLoading.set(false),
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
        this.notification.success("Prato excluído com sucesso!");
        this.loadDishes();
        this.closeDeleteModal();
        this.deleteLoading.set(false);
      },
      error: () => this.deleteLoading.set(false),
    });
  }

  toggleActive(dish: Dish): void {
    this.apiService.toggleDishActive(dish.id).subscribe({
      next: () => {
        this.notification.success(
          dish.active ? "Prato desativado" : "Prato ativado",
        );
        this.loadDishes();
      },
      error: () => {},
    });
  }

  openReorderModal(): void {
    this.reorderDishes.set(
      [...this.dishes()].sort((a, b) => a.displayOrder - b.displayOrder),
    );
    this.reorderModalOpen.set(true);
  }

  closeReorderModal(): void {
    this.reorderModalOpen.set(false);
  }

  onReorderConfirmed(items: ReorderItem[]): void {
    if (this.reorderLoading()) return;

    this.reorderLoading.set(true);
    const reordered = items.map((dish) => ({
      id: dish.id,
      displayOrder: dish.displayOrder,
    }));

    this.apiService.reorderDishes(reordered).subscribe({
      next: () => {
        this.notification.success("Ordem dos pratos atualizada!");
        this.loadDishes();
        this.closeReorderModal();
        this.reorderLoading.set(false);
      },
      error: () => this.reorderLoading.set(false),
    });
  }

  reorderConfig = computed(() => ({
    title: "Reordenar Pratos",
    description: "Arraste e solte os pratos para definir a ordem de exibição",
    confirmLabel: "Salvar ordem",
    emptyMessage: "Nenhum prato para reordenar",
    getItemSubtitle: (item: ReorderItem) => item.subtitle ?? "",
    getItemStatus: (item: ReorderItem) => ({
      label: item.active ? "Ativo" : "Inativo",
      variant: item.active ? ("success" as const) : ("gray" as const),
    }),
  }));

  deleteDescription = computed(() => {
    const dish = this.dishToDelete();
    return dish
      ? `Tem certeza que deseja excluir o prato "${dish.name}"? Esta ação não pode ser desfeita.`
      : "Tem certeza que deseja excluir este prato? Esta ação não pode ser desfeita.";
  });

  galleryTitle = computed(() => {
    const dish = this.galleryDish();
    return dish ? `Imagens de ${dish.name}` : "Imagens";
  });

  onImageError(error: string): void {
    this.notification.error(error);
  }

  openGallery(dish: Dish): void {
    this.galleryDish.set(dish);
    this.galleryImages.set(
      (dish.images ?? []).map((img, index) => ({
        id: img.id,
        url: img.url,
        thumbnailUrl: img.url,
        alt: `${dish.name} - Imagem ${index + 1}`,
        isMain: img.isMain,
      })),
    );
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

  compareById = (a: string, b: string) => a === b;
}
