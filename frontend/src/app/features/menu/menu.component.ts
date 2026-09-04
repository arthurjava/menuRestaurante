import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Category, Dish } from '../../core/models';
import { ImageGalleryComponent } from '../../shared/components/image-gallery/image-gallery.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { CurrencyBrlPipe } from '../../shared/pipes/currency-brl.pipe';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

interface MenuCategory {
  category: Category;
  dishes: Dish[];
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, ImageGalleryComponent, LoadingSpinnerComponent, CurrencyBrlPipe, TruncatePipe, ModalComponent, BadgeComponent, ButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-4">
              <svg class="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ restaurantName }}</h1>
                <p class="text-sm text-gray-500">{{ restaurantTagline }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <a routerLink="/login" class="text-sm font-medium text-primary-600 hover:text-primary-700">Área Admin</a>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        @if (loading()) {
          <div class="text-center py-12">
            <app-loading-spinner size="lg"></app-loading-spinner>
            <p class="mt-4 text-gray-500">Carregando cardápio...</p>
          </div>
        } @else if (menuCategories().length === 0) {
          <div class="text-center py-12">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Nenhum prato disponível</h2>
            <p class="text-gray-500">O cardápio está vazio no momento.</p>
          </div>
        } @else {
          <div class="space-y-12">
            @for (menuCat of menuCategories(); track menuCat.category.id) {
              <section id="category-{{ menuCat.category.id }}" class="scroll-mt-24">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    @if (menuCat.category.imageUrl) {
                      <img [src]="menuCat.category.imageUrl" alt="" class="w-12 h-12 rounded-lg object-cover">
                    } @else {
                      <div class="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                        <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                      </div>
                    }
                    <h2 class="text-2xl font-bold text-gray-900">{{ menuCat.category.name }}</h2>
                  </div>
                  @if (menuCat.category.description) {
                    <p class="text-gray-600 max-w-md">{{ menuCat.category.description | truncate:150 }}</p>
                  }
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  @for (dish of menuCat.dishes; track dish.id) {
                    <article class="card overflow-hidden hover:shadow-md transition-shadow group">
                      <div class="relative aspect-video overflow-hidden bg-gray-100">
                        <app-image-gallery
                          [images]="[{ url: dish.imageUrl || '', alt: dish.name, primary: true }]"
                        ></app-image-gallery>
                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        <button
                          type="button"
                          class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          (click)="openDishModal(dish)"
                          aria-label="Ver detalhes de {{ dish.name }}"
                        >
                          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7z"></path></svg>
                        </button>
                      </div>
                      
                      <div class="p-5">
                        <h3 class="font-semibold text-gray-900 mb-1">{{ dish.name }}</h3>
                        @if (dish.description) {
                          <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ dish.description }}</p>
                        }
                        @if (dish.allergens) {
                          <div class="flex flex-wrap gap-1.5 mb-3">
                            @for (allergen of dish.allergens.split(','); track allergen) {
                              <app-badge variant="warning" class="text-xs">{{ allergen.trim() }}</app-badge>
                            }
                          </div>
                        }
                        <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span class="text-xl font-bold text-primary-600">{{ dish.price | currencyBrl }}</span>
                          @if (dish.prepTimeMinutes) {
                            <span class="text-sm text-gray-500 flex items-center gap-1">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                              {{ dish.prepTimeMinutes }} min
                            </span>
                          }
                        </div>
                      </div>
                    </article>
                  }
                </div>
              </section>
            }
          </div>
        }
      </main>

      <footer class="bg-gray-900 text-gray-300 py-8 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {{ currentYear() }} {{ restaurantName }}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>

    <app-modal
      [isOpen]="dishModalOpen()"
      [title]="selectedDish()?.name || ''"
      [large]="true"
      (close)="closeDishModal()"
    >
      @if (selectedDish()) {
        <div class="space-y-6">
          <app-image-gallery
            [images]="[{ url: selectedDish()!.imageUrl || '', alt: selectedDish()!.name, primary: true }]"
          ></app-image-gallery>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <p class="text-gray-700 whitespace-pre-wrap">{{ selectedDish()?.description || 'Sem descrição' }}</p>
            </div>
            <div class="text-center md:text-right">
              <p class="text-3xl font-bold text-primary-600">{{ selectedDish()?.price | currencyBrl }}</p>
              @if (selectedDish()?.prepTimeMinutes) {
                <p class="text-sm text-gray-500 mt-1 flex items-center justify-end gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {{ selectedDish()?.prepTimeMinutes }} min
                </p>
              }
            </div>
          </div>

          @if (selectedDish()?.allergens) {
            <div class="pt-4 border-t border-gray-200">
              <h4 class="font-medium text-gray-900 mb-2">Alergênicos:</h4>
              <div class="flex flex-wrap gap-2">
                @for (allergen of selectedDish()!.allergens.split(','); track allergen) {
                  <app-badge variant="warning">{{ allergen.trim() }}</app-badge>
                }
              </div>
            </div>
          }
        </div>
      }
    </app-modal>
  `
})
export class MenuComponent implements OnInit {
  private apiService = inject(ApiService);

  restaurantName = 'Restaurante Sabor & Arte';
  restaurantTagline = 'Os melhores sabores da casa';

  loading = signal(true);
  menuCategories = signal<MenuCategory[]>([]);
  
  dishModalOpen = signal(false);
  selectedDish = signal<Dish | null>(null);
  currentYear = signal(new Date().getFullYear());

  async ngOnInit(): Promise<void> {
    await this.loadMenu();
  }

  async loadMenu(): Promise<void> {
    try {
      const [categoriesRes, dishesRes] = await Promise.all([
        this.apiService.getMenuCategories().toPromise(),
        this.apiService.getDishes({ active: true }).toPromise()
      ]);

      const categories = categoriesRes || [];
      const dishes = dishesRes?.content || [];

      const dishesByCategory = new Map<string, Dish[]>();
      dishes.forEach(dish => {
        if (!dishesByCategory.has(dish.categoryId)) {
          dishesByCategory.set(dish.categoryId, []);
        }
        dishesByCategory.get(dish.categoryId)!.push(dish);
      });

      this.menuCategories.set(
        categories
          .filter(c => c.active)
          .map(category => ({
            category,
            dishes: dishesByCategory.get(category.id) || []
          }))
          .filter(mc => mc.dishes.length > 0)
      );
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error);
    } finally {
      this.loading.set(false);
    }
  }

  openDishModal(dish: Dish): void {
    this.selectedDish.set(dish);
    this.dishModalOpen.set(true);
  }

  closeDishModal(): void {
    this.dishModalOpen.set(false);
    this.selectedDish.set(null);
  }
}