import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  effect,
  HostListener,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { MatBadgeModule } from "@angular/material/badge";
import { MatDividerModule } from "@angular/material/divider";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ApiService } from "@core/services/api.service";
import { NotificationService } from "@core/services/notification.service";
import { LoadingService } from "@core/services/loading.service";
import { environment } from "@environments/environment";
import {
  ImageGalleryComponent,
  GalleryImage,
} from "@shared/components/image-gallery/image-gallery.component";
import { ButtonComponent } from "@shared/components/button/button.component";
import { BadgeComponent } from "@shared/components/badge/badge.component";
import { ModalComponent } from "@shared/components/modal/modal.component";

export interface PublicDish {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryName: string;
  images: { id: string; url: string; isMain: boolean }[];
  active: boolean;
}

export interface PublicCategory {
  id: string;
  name: string;
  imageUrl?: string;
  displayOrder: number;
}

export interface RestaurantInfo {
  id?: string;
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
}

export interface BusinessHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  closed?: boolean;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
}

@Component({
  selector: "app-menu",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
    ImageGalleryComponent,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4"
          >
            <div class="flex items-center gap-3">
              @if (restaurantInfo().logoUrl) {
                <img
                  [src]="restaurantInfo().logoUrl"
                  alt="Logo"
                  class="h-12 w-auto rounded-lg"
                />
              } @else {
                <div
                  class="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center"
                >
                  <mat-icon class="text-indigo-600 text-2xl"
                    >restaurant</mat-icon
                  >
                </div>
              }
              <div>
                <h1 class="text-xl font-bold text-gray-900">
                  {{ restaurantInfo().name ?? "Nosso Restaurante" }}
                </h1>
                <p class="text-sm text-gray-500">
                  {{ restaurantInfo().tagline ?? "Cardápio Digital" }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto">
              <div class="flex-1 sm:w-64 relative">
                <mat-icon
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >search</mat-icon
                >
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (ngModelChange)="onSearchChange($event)"
                  placeholder="Buscar pratos..."
                  class="input pl-10 pr-4 w-full"
                  autocomplete="off"
                />
              </div>
              <app-button
                variant="outline"
                icon="filter_list"
                label="Categorias"
                (clicked)="toggleCategoryFilter()"
              >
              </app-button>
            </div>
          </div>

          <!-- Category Filter Chips -->
          @if (showCategoryFilter()) {
            <div class="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
              <button
                type="button"
                class="chip"
                [class.active]="selectedCategory() === ''"
                (click)="selectCategory('')"
              >
                Todas
              </button>
              @for (category of categories(); track category.id) {
                <button
                  type="button"
                  class="chip"
                  [class.active]="selectedCategory() === category.id"
                  (click)="selectCategory(category.id)"
                >
                  {{ category.name }}
                </button>
              }
            </div>
          }
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
              <div class="animate-pulse">
                <div class="aspect-[4/3] bg-gray-200 rounded-xl mb-3"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div class="h-5 bg-gray-200 rounded w-1/4"></div>
              </div>
            }
          </div>
        } @else {
          @if (filteredDishes().length === 0) {
            <div class="text-center py-16">
              <mat-icon class="text-6xl text-gray-300 mb-4"
                >restaurant_menu</mat-icon
              >
              <h2 class="text-xl font-medium text-gray-900 mb-2">
                Nenhum prato encontrado
              </h2>
              <p class="text-gray-500">Tente ajustar sua busca ou filtro</p>
            </div>
          } @else {
            <!-- Category Sections -->
            @for (category of categoriesWithDishes(); track category.id) {
              <section class="mb-12" [id]="'category-' + category.id">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    @if (category.imageUrl) {
                      <img
                        [src]="category.imageUrl"
                        alt=""
                        class="h-10 w-10 rounded-lg object-cover"
                      />
                    } @else {
                      <div
                        class="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center"
                      >
                        <mat-icon class="text-indigo-600">category</mat-icon>
                      </div>
                    }
                    <h2 class="text-2xl font-bold text-gray-900">
                      {{ category.name }}
                    </h2>
                  </div>
                  <span class="text-sm text-gray-500"
                    >{{ getDishesForCategory(category.id).length }} pratos</span
                  >
                </div>

                <div
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  @for (
                    dish of getDishesForCategory(category.id);
                    track dish.id
                  ) {
                    <article class="dish-card group">
                      <div
                        class="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-3"
                      >
                        @if (dish.images.length > 0) {
                          <img
                            [src]="dish.images[0].url"
                            [alt]="dish.name"
                            crossorigin="anonymous"
                            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        } @else {
                          <div
                            class="w-full h-full flex items-center justify-center"
                          >
                            <mat-icon class="text-4xl text-gray-300"
                              >restaurant</mat-icon
                            >
                          </div>
                        }

                        @if (dish.images.length > 1) {
                          <button
                            type="button"
                            class="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            (click)="openImageGallery(dish)"
                            matTooltip="Ver todas as imagens"
                            aria-label="Ver todas as imagens de {{ dish.name }}"
                          >
                            <mat-icon class="text-gray-600"
                              >photo_library</mat-icon
                            >
                          </button>
                        }
                      </div>

                      <h3 class="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {{ dish.name }}
                      </h3>
                      @if (dish.description) {
                        <p class="text-sm text-gray-500 mb-2 line-clamp-2">
                          {{ dish.description }}
                        </p>
                      }
                      <div class="flex items-center justify-between">
                        <span class="text-lg font-bold text-indigo-600"
                          >R$
                          {{ dish.price.toFixed(2).replace(".", ",") }}</span
                        >
                        <app-button
                          variant="primary"
                          size="sm"
                          icon="add_shopping_cart"
                          label="Adicionar"
                          class="opacity-0 group-hover:opacity-100 transition-opacity"
                          (clicked)="addToOrder(dish)"
                        >
                        </app-button>
                      </div>
                    </article>
                  }
                </div>
              </section>
            }
          }
        }
      </main>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 class="font-semibold text-lg mb-4">
                {{ restaurantInfo().name ?? "Nosso Restaurante" }}
              </h3>
              <p class="text-gray-400">
                {{
                  restaurantInfo().description ??
                    "O melhor da culinária para você."
                }}
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-lg mb-4">
                Horário de Funcionamento
              </h3>
              <div class="space-y-2 text-gray-400">
                @for (hours of businessHours(); track hours.dayOfWeek) {
                  <div class="flex justify-between">
                    <span>{{ getDayName(hours.dayOfWeek) }}</span>
                    <span>{{ hours.openTime }} - {{ hours.closeTime }}</span>
                  </div>
                }
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-lg mb-4">Contato</h3>
              <div class="space-y-2 text-gray-400">
                @if (contactInfo().phone) {
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-sm">phone</mat-icon>
                    <span>{{ contactInfo().phone }}</span>
                  </div>
                }
                @if (contactInfo().email) {
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-sm">email</mat-icon>
                    <span>{{ contactInfo().email }}</span>
                  </div>
                }
                @if (contactInfo().address) {
                  <div class="flex items-start gap-2">
                    <mat-icon class="text-sm mt-0.5">location_on</mat-icon>
                    <span>{{ contactInfo().address }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
          <mat-divider class="my-8 border-gray-800"></mat-divider>
          <p class="text-center text-gray-500 text-sm">
            &copy; {{ currentYear() }}
            {{ restaurantInfo().name ?? "Nosso Restaurante" }}. Todos os
            direitos reservados.
          </p>
        </div>
      </footer>

      <!-- Image Gallery Modal -->
      <app-modal
        [isOpen]="galleryModalOpen()"
        [title]="galleryDish()?.name ?? 'Imagens'"
        [confirmLabel]="'Fechar'"
        [showFooter]="true"
        size="xl"
        (isOpenChange)="closeGalleryModal()"
        (confirmed)="closeGalleryModal()"
        (cancelled)="closeGalleryModal()"
      >
        <app-image-gallery
          [images]="galleryImages()"
          (imageSelected)="onGalleryImageSelect($event)"
        >
        </app-image-gallery>
      </app-modal>

      <!-- Dish Detail Modal -->
      <app-modal
        [isOpen]="detailModalOpen()"
        [title]="getDetailDish()?.name ?? 'Detalhes do Prato'"
        [description]="getDetailDescription()"
        [confirmLabel]="'Fechar'"
        [showFooter]="true"
        size="lg"
        (isOpenChange)="closeDetailModal()"
        (confirmed)="closeDetailModal()"
        (cancelled)="closeDetailModal()"
      >
        <div class="space-y-4">
          @if (getDetailImages().length > 0) {
            <div class="aspect-[4/3] rounded-xl overflow-hidden">
              <img
                [src]="getDetailImages()[0].url"
                [alt]="getDetailDish()?.name ?? 'Prato'"
                crossorigin="anonymous"
                class="w-full h-full object-cover"
              />
            </div>
          }
          <div class="flex items-center justify-between">
            <span class="text-2xl font-bold text-indigo-600"
              >R$ {{ getDetailPrice() }}</span
            >
            <app-badge
              [label]="getDetailDish()?.categoryName ?? ''"
              variant="primary"
              size="md"
            >
            </app-badge>
          </div>
          @if (getDetailDescription()) {
            <p class="text-gray-600">{{ getDetailDescription() }}</p>
          }
          <div class="flex gap-3 pt-4">
            <app-button
              variant="primary"
              [fullWidth]="true"
              icon="add_shopping_cart"
              label="Adicionar ao Pedido"
              (clicked)="addToOrder(getDetailDish()!)"
            >
            </app-button>
            @if ((getDetailDish()?.images?.length ?? 0) > 1) {
              <app-button
                variant="outline"
                [fullWidth]="true"
                icon="photo_library"
                label="Ver Imagens"
                (clicked)="openImageGallery(getDetailDish()!)"
              >
              </app-button>
            }
          </div>
        </div>
      </app-modal>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .chip {
        @apply px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200;
        @apply border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:text-indigo-600;
      }

      .chip.active {
        @apply border-indigo-600 bg-indigo-600 text-white;
      }

      .dish-card {
        @apply bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300;
      }

      .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      @media (max-width: 640px) {
        .grid-cols-2 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit {
  private apiService = inject(ApiService);
  private notification = inject(NotificationService);
  private loadingService = inject(LoadingService);

  // State
  loading = signal(true);
  dishes = signal<PublicDish[]>([]);
  categories = signal<PublicCategory[]>([]);
  restaurantInfo = signal<RestaurantInfo>({} as RestaurantInfo);
  businessHours = signal<BusinessHour[]>([]);
  contactInfo = signal<ContactInfo>({} as ContactInfo);

  // Filters
  searchTerm = "";
  selectedCategory = signal<string>("");
  showCategoryFilter = signal(false);

  // Modals
  galleryModalOpen = signal(false);
  galleryDish = signal<PublicDish | null>(null);
  galleryImages = signal<GalleryImage[]>([]);

  detailModalOpen = signal(false);
  detailDish = signal<PublicDish | null>(null);

  filteredDishes = computed(() => {
    let filtered = this.dishes().filter((d) => d.active);

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dish) =>
          dish.name.toLowerCase().includes(term) ||
          dish.description?.toLowerCase().includes(term),
      );
    }

    if (this.selectedCategory()) {
      filtered = filtered.filter(
        (dish) => dish.categoryId === this.selectedCategory(),
      );
    }

    return filtered;
  });

  categoriesWithDishes = computed(() => {
    return this.categories()
      .filter((cat) =>
        this.filteredDishes().some((dish) => dish.categoryId === cat.id),
      )
      .sort((a, b) => a.displayOrder - b.displayOrder);
  });

  ngOnInit(): void {
    this.loadMenuData();
  }

  loadMenuData(): void {
    this.loading.set(true);

    // Load categories
    this.apiService.getPublicCategories().subscribe({
      next: (cats: any[]) => {
        this.categories.set(
          cats.map((c) => ({
            id: c.id,
            name: c.name,
            imageUrl: c.imageUrl,
            displayOrder: c.displayOrder,
          })),
        );
      },
      error: (err) => {
        console.error("Erro ao carregar categorias:", err);
        this.notification.error("Erro ao carregar categorias");
        this.loading.set(false);
      },
    });

    // Load dishes
    this.apiService.getPublicMenu().subscribe({
      next: (data: any[]) => {
        this.dishes.set(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            categoryId: item.category?.id,
            categoryName: item.category?.name,
            images: (item.images ?? []).map((img: any) => ({
              id: img.id,
              url: `${environment.imageBaseUrl}${img.imageUrl}`,
              isMain: img.primary,
            })),
            active: item.active,
          })),
        );
      },
      error: (err) => {
        console.error("Erro ao carregar pratos:", err);
        this.notification.error("Erro ao carregar cardápio");
        this.loading.set(false);
      },
    });

    // Load restaurant info
    this.apiService.getPublicRestaurantInfo().subscribe({
      next: (info: any) => this.restaurantInfo.set(info),
      error: (err) => {
        console.error("Erro ao carregar informações do restaurante:", err);
        this.notification.error("Erro ao carregar informações do restaurante");
        this.loading.set(false);
      },
    });

    // Load business hours
    this.apiService.getPublicBusinessHours().subscribe({
      next: (hours: BusinessHour[]) => this.businessHours.set(hours),
      error: (err) => {
        console.error("Erro ao carregar horários:", err);
        this.notification.error("Erro ao carregar horários de funcionamento");
        this.loading.set(false);
      },
    });

    // Load contact info
    this.apiService.getPublicContactInfo().subscribe({
      next: (contact: ContactInfo) => this.contactInfo.set(contact),
      error: (err) => {
        console.error("Erro ao carregar contato:", err);
        this.notification.error("Erro ao carregar informações de contato");
        this.loading.set(false);
      },
    });

    // Simulate loading delay
    setTimeout(() => this.loading.set(false), 500);
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
    this.showCategoryFilter.set(false);
  }

  toggleCategoryFilter(): void {
    this.showCategoryFilter.update((v) => !v);
  }

  getDishesForCategory(categoryId: string): PublicDish[] {
    return this.filteredDishes().filter((d) => d.categoryId === categoryId);
  }

  getDayName(dayOfWeek: number): string {
    const days = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];
    return days[dayOfWeek] ?? "";
  }

  openImageGallery(dish: PublicDish | null): void {
    if (!dish) return;
    this.galleryDish.set(dish);
    this.galleryImages.set(
      dish.images.map((img, index) => ({
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

  openDetailModal(dish: PublicDish): void {
    this.detailDish.set(dish);
    this.detailModalOpen.set(true);
  }

  closeDetailModal(): void {
    this.detailModalOpen.set(false);
    setTimeout(() => {
      this.detailDish.set(null);
    }, 250);
  }

  onGalleryImageSelect(index: number): void {
    // Handle if needed
  }

  addToOrder(dish: PublicDish | null): void {
    if (!dish) return;
    // Emit event or use a cart service
    this.notification.success(`${dish.name} adicionado ao pedido!`);
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (this.galleryModalOpen()) this.closeGalleryModal();
    if (this.detailModalOpen()) this.closeDetailModal();
  }

  currentYear(): number {
    return new Date().getFullYear();
  }

  getDetailPrice(): string {
    const dish = this.detailDish();
    return dish ? dish.price.toFixed(2).replace(".", ",") : "0,00";
  }

  getDetailDish(): PublicDish | null {
    return this.detailDish();
  }

  getDetailImages(): { id: string; url: string; isMain: boolean }[] {
    return this.detailDish()?.images ?? [];
  }

  getDetailDescription(): string {
    return this.detailDish()?.description ?? "";
  }
}