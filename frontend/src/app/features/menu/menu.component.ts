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
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
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
  dietary?: string[]; // vegan, vegetarian, gluten-free, spicy
  popular?: boolean;
}
export interface PublicCategory {
  id: string;
  name: string;
  imageUrl?: string;
  displayOrder: number;
  icon?: string; // emoji or icon name
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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
    <div class="min-h-screen bg-surface-secondary">
      <!-- Hero Section -->
      <header
        class="relative bg-gradient-to-b from-brand-primary/10 to-transparent"
      >
        @if (restaurantInfo().coverUrl) {
          <div class="absolute inset-0 z-0">
            <img
              [src]="restaurantInfo().coverUrl"
              alt=""
              class="w-full h-64 md:h-80 object-cover"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-surface-primary/90 via-surface-primary/50 to-transparent"
            ></div>
          </div>
        }
        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 py-10 md:py-16"
          >
            <div>
              @if (restaurantInfo().logoUrl) {
                <img
                  [src]="restaurantInfo().logoUrl"
                  alt="Logo"
                  class="h-16 w-auto rounded-xl mb-3 shadow-lg"
                />
              } @else {
                <img
                  src="assets/logo.svg"
                  alt="Logo Nosso Restaurante"
                  class="h-16 w-auto rounded-xl mb-3 shadow-lg"
                />
              }
              <h1 class="text-3xl md:text-4xl font-bold text-text-primary">
                {{ restaurantInfo().name ?? "Nosso Restaurante" }}
              </h1>
              <p class="text-lg text-text-secondary mt-2 max-w-xl">
                {{
                  restaurantInfo().tagline ??
                    "Cardápio Digital - Peça online com facilidade"
                }}
              </p>
              <div class="flex flex-wrap gap-2 mt-4 text-sm text-text-tertiary">
                @if (contactInfo().address) {
                  <span class="flex items-center gap-1"
                    >📍 {{ contactInfo().address }}</span
                  >
                }
                @if (contactInfo().phone) {
                  <span class="flex items-center gap-1"
                    >📞 {{ contactInfo().phone }}</span
                  >
                }
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div class="flex-1 sm:w-72 relative">
                <label for="search-input" class="sr-only">Buscar pratos</label>
                <input
                  type="text"
                  id="search-input"
                  [(ngModel)]="searchTerm"
                  (ngModelChange)="onSearchChange($event)"
                  placeholder="Buscar pratos, ingredientes..."
                  class="input pl-12 pr-4 w-full"
                  autocomplete="off"
                />
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                  >🔍</span
                >
              </div>
              <app-button
                variant="outline"
                icon="filter_list"
                label="Filtrar"
                (clicked)="toggleCategoryFilter()"
              >
              </app-button>
            </div>
          </div>
        </div>

        <!-- Sticky Category Tabs -->
        <nav
          class="sticky top-16 z-30 bg-surface-primary/95 backdrop-blur-sm border-b border-border"
          [class.hidden]="!showCategoryFilter()"
          aria-label="Categorias do cardápio"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              class="flex gap-2 overflow-x-auto pb-3 px-4 -ml-4"
              role="tablist"
            >
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="selectedCategory() === ''"
                [class]="
                  'chip px-4 py-2 whitespace-nowrap ' +
                  (selectedCategory() === ''
                    ? 'bg-brand-primary text-brand-on-primary border-brand-primary shadow-sm'
                    : 'bg-surface-primary text-text-secondary border-border hover:border-brand-primary hover:text-brand-primary-hover')
                "
                (click)="selectCategory('')"
              >
                <span class="flex items-center gap-1.5">
                  <span>🍽</span>
                  Todas
                </span>
              </button>
              @for (category of categories(); track category.id) {
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="selectedCategory() === category.id"
                  [class]="
                    'chip px-4 py-2 whitespace-nowrap ' +
                    (selectedCategory() === category.id
                      ? 'bg-brand-primary text-brand-on-primary border-brand-primary shadow-sm'
                      : 'bg-surface-primary text-text-secondary border-border hover:border-brand-primary hover:text-brand-primary-hover')
                  "
                  (click)="selectCategory(category.id)"
                >
                  <span class="flex items-center gap-1.5">
                    @if (category.icon) {
                      <span>{{ category.icon }}</span>
                    } @else {
                      <span>🍽</span>
                    }
                    <span>{{ category.name }}</span>
                  </span>
                  @if (getDishesForCategory(category.id).length > 0) {
                    <span
                      class="ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-full bg-brand-primary-subtle text-brand-primary-hover"
                    >
                      {{ getDishesForCategory(category.id).length }}
                    </span>
                  }
                </button>
              }
            </div>
          </div>
        </nav>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (loading()) {
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
              <div class="animate-pulse">
                <div
                  class="aspect-[4/3] bg-surface-tertiary rounded-xl mb-3"
                ></div>
                <div class="h-5 bg-surface-tertiary rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-surface-tertiary rounded w-1/2 mb-1"></div>
                <div class="flex items-center gap-2">
                  <div class="h-6 bg-surface-tertiary rounded w-20"></div>
                  <div class="h-6 bg-surface-tertiary rounded w-16"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          @if (filteredDishes().length === 0) {
            <div class="text-center py-16">
              <div
                class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-primary-subtle mb-4"
              >
                <span class="text-3xl">🍽</span>
              </div>
              <h2 class="text-h4 font-medium text-text-primary mb-2">
                Nenhum prato encontrado
              </h2>
              <p class="text-text-tertiary mb-6 max-w-md mx-auto">
                Tente ajustar sua busca ou selecione outra categoria
              </p>
              <app-button
                variant="outline"
                icon="filter_alt_off"
                label="Limpar filtros"
                (clicked)="clearFilters()"
              >
              </app-button>
            </div>
          } @else {
            <!-- Category Sections -->
            @for (category of categoriesWithDishes(); track category.id) {
              <section class="mb-14" [id]="'category-' + category.id">
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
                        class="h-10 w-10 rounded-lg bg-brand-primary-subtle flex items-center justify-center text-xl"
                      >
                        {{ category.icon ?? "🍽" }}
                      </div>
                    }
                    <div>
                      <h2 class="text-h3 font-bold text-text-primary">
                        {{ category.name }}
                      </h2>
                      <p class="text-sm text-text-tertiary">
                        {{ getDishesForCategory(category.id).length }} prato{{
                          getDishesForCategory(category.id).length !== 1
                            ? "s"
                            : ""
                        }}
                      </p>
                    </div>
                  </div>
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
                        class="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-tertiary"
                      >
                        @if (dish.images.length > 0) {
                          <img
                            [src]="dish.images[0].url"
                            [alt]="dish.name"
                            crossorigin="anonymous"
                            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        } @else {
                          <div
                            class="w-full h-full flex items-center justify-center bg-surface-tertiary"
                          >
                            <span class="text-4xl">🍽</span>
                          </div>
                        }

                        <!-- Badges -->
                        <div class="absolute top-2 left-2 flex flex-col gap-1">
                          @if (dish.popular) {
                            <span
                              class="badge px-2 py-1 text-xs font-semibold bg-amber-500 text-white shadow-lg"
                            >
                              ⭐ Popular
                            </span>
                          }
                          @for (
                            diet of getDietaryBadges(dish.dietary);
                            track diet
                          ) {
                            <span
                              class="badge px-2 py-1 text-xs font-medium"
                              [class]="diet.class"
                            >
                              {{ diet.icon }} {{ diet.label }}
                            </span>
                          }
                        </div>

                        @if (dish.images.length > 1) {
                          <button
                            type="button"
                            class="absolute top-2 right-2 p-2 bg-surface-primary/90 backdrop-blur-sm rounded-full shadow-chip opacity-0 group-hover:opacity-100 transition-opacity"
                            (click)="openImageGallery(dish)"
                            matTooltip="Ver todas as imagens"
                            aria-label="Ver todas as imagens de {{ dish.name }}"
                          >
                            <span class="text-lg">🖼</span>
                          </button>
                        }
                      </div>

                      <div class="p-4">
                        <div
                          class="flex items-start justify-between gap-2 mb-2"
                        >
                          <h3
                            class="font-semibold text-text-primary line-clamp-1 flex-1"
                          >
                            {{ dish.name }}
                          </h3>
                          @if (dish.popular) {
                            <span
                              class="flex items-center gap-1 text-amber-500 text-sm font-medium whitespace-nowrap"
                            >
                              <span>⭐</span> Popular
                            </span>
                          }
                        </div>

                        @if (dish.description) {
                          <p
                            class="text-body-sm text-text-tertiary mb-3 line-clamp-2"
                          >
                            {{ dish.description }}
                          </p>
                        }

                        @if (dish.dietary && dish.dietary.length > 0) {
                          <div class="flex flex-wrap gap-1.5 mb-3">
                            @for (
                              diet of getDietaryBadges(dish.dietary);
                              track diet
                            ) {
                              <span
                                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
                                [class]="diet.class"
                              >
                                {{ diet.icon }} {{ diet.label }}
                              </span>
                            }
                          </div>
                        }

                        <div
                          class="flex items-center justify-between pt-3 border-t border-border"
                        >
                          <span class="text-lg font-bold text-brand-primary"
                            >R$
                            {{ dish.price.toFixed(2).replace(".", ",") }}</span
                          >
                          <app-button
                            variant="primary"
                            size="sm"
                            icon="add_shopping_cart"
                            label="Adicionar"
                            (clicked)="addToOrder(dish)"
                            class="w-full sm:w-auto"
                          >
                          </app-button>
                        </div>
                      </div>
                    </article>
                  }
                </div>
              </section>
            }
          }
        }
      </main>

      <!-- Floating Cart CTA (when items in cart) -->
      @if (cartItemCount() > 0) {
        <div class="fixed bottom-6 right-6 z-40 animate-slide-up">
          <app-button
            variant="primary"
            size="lg"
            icon="shopping_cart"
            [label]="'Ver Pedido (' + cartItemCount() + ')'"
            class="shadow-xl"
            (clicked)="openCart()"
          >
          </app-button>
        </div>
      }

      <!-- Footer -->
      <footer class="bg-surface-inverse text-text-inverse py-12 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 class="font-semibold text-lg mb-4">
                {{ restaurantInfo().name ?? "Nosso Restaurante" }}
              </h3>
              <p class="text-text-tertiary">
                {{
                  restaurantInfo().description ??
                    "O melhor da culinária para você. Peça online com facilidade e rapidez."
                }}
              </p>
              <div class="flex gap-4 mt-4">
                @if (contactInfo().instagram) {
                  <a
                    [href]="contactInfo().instagram"
                    target="_blank"
                    rel="noopener"
                    class="text-text-tertiary hover:text-brand-primary transition-colors"
                    aria-label="Instagram"
                  >
                    📷
                  </a>
                }
                @if (contactInfo().facebook) {
                  <a
                    [href]="contactInfo().facebook"
                    target="_blank"
                    rel="noopener"
                    class="text-text-tertiary hover:text-brand-primary transition-colors"
                    aria-label="Facebook"
                  >
                    📘
                  </a>
                }
                @if (contactInfo().website) {
                  <a
                    [href]="contactInfo().website"
                    target="_blank"
                    rel="noopener"
                    class="text-text-tertiary hover:text-brand-primary transition-colors"
                    aria-label="Site"
                  >
                    🌐
                  </a>
                }
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-lg mb-4">
                Horário de Funcionamento
              </h3>
              <div class="space-y-2 text-text-tertiary">
                @for (hours of businessHours(); track hours.dayOfWeek) {
                  <div class="flex justify-between gap-4">
                    <span>{{ getDayName(hours.dayOfWeek) }}</span>
                    <span class="font-medium">{{
                      hours.closed
                        ? "Fechado"
                        : hours.openTime + " - " + hours.closeTime
                    }}</span>
                  </div>
                }
              </div>
            </div>
            <div>
              <h3 class="font-semibold text-lg mb-4">Contato</h3>
              <div class="space-y-2 text-text-tertiary">
                @if (contactInfo().phone) {
                  <a
                    [href]="'tel:' + contactInfo().phone"
                    class="flex items-center gap-2 hover:text-brand-primary transition-colors"
                  >
                    <span>📞</span>
                    <span>{{ contactInfo().phone }}</span>
                  </a>
                }
                @if (contactInfo().email) {
                  <a
                    [href]="'mailto:' + contactInfo().email"
                    class="flex items-center gap-2 hover:text-brand-primary transition-colors"
                  >
                    <span>✉</span>
                    <span>{{ contactInfo().email }}</span>
                  </a>
                }
                @if (contactInfo().address) {
                  <address class="flex items-start gap-2 not-italic">
                    <span>📍</span>
                    <span>{{ contactInfo().address }}</span>
                  </address>
                }
              </div>
            </div>
          </div>
          <mat-divider class="my-8 border-border-strong"></mat-divider>
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <p class="text-center md:text-left text-text-tertiary text-sm">
              &copy; {{ currentYear() }}
              {{ restaurantInfo().name ?? "Nosso Restaurante" }}. Todos os
              direitos reservados.
            </p>
            <p class="text-center md:text-right text-text-tertiary text-sm">
              Desenvolvido com ❤️ para uma melhor experiência gastronômica
            </p>
          </div>
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
            <span class="text-h3 font-bold text-brand-primary"
              >R$ {{ getDetailPrice() }}</span
            >
            <app-badge
              [label]="getDetailDish()?.categoryName ?? ''"
              variant="primary"
              size="md"
            >
            </app-badge>
          </div>
          @if (getDetailDish()?.dietary?.length) {
            <div class="flex flex-wrap gap-2">
              @for (
                diet of getDietaryBadges(getDetailDish()!.dietary!);
                track diet
              ) {
                <span
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full"
                  [class]="diet.class"
                >
                  {{ diet.icon }} {{ diet.label }}
                </span>
              }
            </div>
          }
          @if (getDetailDescription()) {
            <p class="text-text-secondary">{{ getDetailDescription() }}</p>
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
        @apply px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200;
        @apply border-border bg-surface-primary text-text-secondary hover:border-brand-primary hover:text-brand-primary-hover;
        box-shadow: var(--shadow-chip, 0 1px 2px 0 rgb(0 0 0 / 0.03));
      }
      .chip.active {
        @apply bg-brand-primary text-brand-on-primary border-brand-primary shadow-sm;
      }
      .dish-card {
        @apply bg-surface-primary rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300;
        @apply flex flex-col;
      }
      .dish-card > div:first-child {
        @apply flex-shrink-0;
      }
      .dish-card > div:last-child {
        @apply flex-1 flex flex-col;
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
      .badge {
        @apply inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full;
      }
      .badge-primary {
        @apply bg-brand-primary-subtle text-brand-primary-hover;
      }
      .badge-success {
        @apply bg-emerald-50 text-emerald-700;
      }
      .badge-warning {
        @apply bg-amber-50 text-amber-700;
      }
      .badge-danger {
        @apply bg-rose-50 text-rose-700;
      }
      .badge-info {
        @apply bg-blue-50 text-blue-700;
      }
      .badge-green {
        @apply bg-green-50 text-green-700;
      }
      .badge-purple {
        @apply bg-purple-50 text-purple-700;
      }
      .badge-red {
        @apply bg-rose-50 text-rose-700;
      }
      .badge-orange {
        @apply bg-amber-50 text-amber-700;
      }
      @keyframes slide-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-slide-up {
        animation: slide-up 0.3s ease-out;
      }
      @media (max-width: 640px) {
        .grid-cols-2 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        .grid-cols-3 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        .grid-cols-4 {
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
  // Cart (placeholder - would integrate with cart service)
  cartItems = signal<any[]>([]);
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

  cartItemCount = computed(() => this.cartItems().length);

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
            icon: c.icon,
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
            dietary: item.dietary,
            popular: item.popular,
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

  clearFilters(): void {
    this.searchTerm = "";
    this.selectedCategory.set("");
    this.showCategoryFilter.set(false);
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

  getDietaryBadges(
    dietary?: string[],
  ): { label: string; icon: string; class: string }[] {
    if (!dietary) return [];
    const badgeMap: Record<
      string,
      { label: string; icon: string; class: string }
    > = {
      vegan: { label: "Vegano", icon: "🌱", class: "badge-success" },
      vegetarian: { label: "Vegetariano", icon: "🥬", class: "badge-green" },
      "gluten-free": {
        label: "Sem Glúten",
        icon: "🌾",
        class: "badge-warning",
      },
      spicy: { label: "Picante", icon: "🌶", class: "badge-danger" },
      halal: { label: "Halal", icon: "☪", class: "badge-info" },
      kosher: { label: "Kosher", icon: "✡", class: "badge-purple" },
      organic: { label: "Orgânico", icon: "🌿", class: "badge-green" },
    };
    return dietary
      .map((d) => badgeMap[d.toLowerCase()])
      .filter((b) => b !== undefined) as {
      label: string;
      icon: string;
      class: string;
    }[];
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
    this.cartItems.update((items) => [...items, { ...dish, quantity: 1 }]);
    this.notification.success(`${dish.name} adicionado ao pedido!`);
  }

  openCart(): void {
    // Navigate to cart or open cart modal
    this.notification.info("Carrinho será implementado em breve");
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
