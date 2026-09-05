import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Dish } from '../../../core/models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ImageGalleryComponent } from '../../../shared/components/image-gallery/image-gallery.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-dish-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, BadgeComponent, ModalComponent, ImageGalleryComponent, LoadingSpinnerComponent, CurrencyBrlPipe, TruncatePipe],
  template: `
    @if (dish(); as currentDish) {
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="page-title">{{ currentDish.name }}</h1>
            <p class="page-subtext">{{ currentDish.categoryName }}</p>
          </div>
          <div class="flex gap-3">
            <app-button variant="primary" [routerLink]="['/dishes', currentDish.id, 'edit']">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Editar
            </app-button>
            <app-button variant="secondary" routerLink="/dishes">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Voltar
            </app-button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="card p-6">
              <app-image-gallery
                [images]="galleryImages()"
                (lightboxOpen)="onLightboxOpen($event)"
              ></app-image-gallery>
            </div>

            <div class="card p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Descrição</h2>
              <p class="text-gray-700 whitespace-pre-wrap">{{ currentDish.description || 'Sem descrição' }}</p>
            </div>

            @if (currentDish.allergens) {
              <div class="card p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Alergênicos</h2>
                <div class="flex flex-wrap gap-2">
                  @for (allergen of currentDish.allergens.split(','); track allergen) {
                    <app-badge variant="warning">{{ allergen.trim() }}</app-badge>
                  }
                </div>
              </div>
            }
          </div>

          <div class="space-y-6">
            <div class="card p-6">
              <div class="text-center">
                <p class="text-sm text-gray-500">Preço</p>
                <p class="text-3xl font-bold text-gray-900">{{ currentDish.price | currencyBrl }}</p>
              </div>
            </div>

            <div class="card p-6 space-y-4">
              <h2 class="text-lg font-semibold text-gray-900">Detalhes</h2>
              
              <dl class="space-y-3">
                @if (currentDish.prepTimeMinutes) {
                  <div class="flex justify-between">
                    <dt class="text-gray-500">Tempo de preparo</dt>
                    <dd class="font-medium">{{ currentDish.prepTimeMinutes }} min</dd>
                  </div>
                }
                @if (currentDish.calories) {
                  <div class="flex justify-between">
                    <dt class="text-gray-500">Calorias</dt>
                    <dd class="font-medium">{{ currentDish.calories }} kcal</dd>
                  </div>
                }
                <div class="flex justify-between">
                  <dt class="text-gray-500">Categoria</dt>
                  <dd class="font-medium">{{ currentDish.categoryName }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">Status</dt>
                  <dd>
                    <app-badge [variant]="currentDish.active ? 'success' : 'gray'">
                      {{ currentDish.active ? 'Ativo' : 'Inativo' }}
                    </app-badge>
                  </dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-gray-500">Criado em</dt>
                  <dd class="font-medium">{{ currentDish.createdAt | date:'dd/MM/yyyy HH:mm' }}</dd>
                </div>
                @if (currentDish.updatedAt && currentDish.updatedAt !== currentDish.createdAt) {
                  <div class="flex justify-between">
                    <dt class="text-gray-500">Atualizado em</dt>
                    <dd class="font-medium">{{ currentDish.updatedAt | date:'dd/MM/yyyy HH:mm' }}</dd>
                  </div>
                }
              </dl>
            </div>

          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Ações</h2>
            <div class="space-y-2">
              <app-button variant="outline" class="w-full justify-start" [routerLink]="['/dishes', currentDish.id, 'edit']">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Editar prato
              </app-button>
              <app-button variant="outline" class="w-full justify-start" (click)="toggleActive()">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                {{ currentDish.active ? 'Desativar' : 'Ativar' }}
              </app-button>
              <app-button variant="danger" class="w-full justify-start" (click)="openDeleteConfirm()">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Excluir prato
              </app-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  } @else {
    <div class="card p-12 text-center">
      <app-loading-spinner size="lg"></app-loading-spinner>
      <p class="mt-4 text-gray-500">Carregando prato...</p>
    </div>
  }

  <app-modal
    [isOpen]="deleteConfirmOpen()"
    title="Excluir prato"
    (close)="deleteConfirmOpen.set(false)"
  >
    <p class="text-gray-600">Tem certeza que deseja excluir o prato <strong>{{ dish()?.name }}</strong>? Esta ação não pode ser desfeita.</p>
    <div slot="footer" class="flex justify-end gap-3">
      <app-button variant="secondary" (click)="deleteConfirmOpen.set(false)">Cancelar</app-button>
      <app-button variant="danger" (click)="confirmDelete()" [loading]="deleting()">Excluir</app-button>
    </div>
  </app-modal>
`
})
export class DishDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);

  dish = signal<Dish | null>(null);
  deleteConfirmOpen = signal(false);
  deleting = signal(false);

  galleryImages = computed(() => {
    const currentDish = this.dish();
    if (!currentDish) return [];
    return currentDish.images?.map(img => ({ url: img.imageUrl, alt: currentDish.name, primary: img.primary })) || 
           (currentDish.imageUrl ? [{ url: currentDish.imageUrl, alt: currentDish.name, primary: true }] : []);
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadDish(id);
    }
  }

  async loadDish(id: string): Promise<void> {
    try {
      const dish = await this.apiService.getDish(id).toPromise();
      if (!dish) {
        this.notificationService.error('Erro', 'Prato não encontrado');
        this.router.navigate(['/dishes']);
        return;
      }
      this.dish.set(dish);
    } catch (error) {
      this.notificationService.error('Erro', 'Prato não encontrado');
      this.router.navigate(['/dishes']);
    }
  }

  async toggleActive(): Promise<void> {
    const d = this.dish();
    if (!d) return;

    try {
      await this.apiService.toggleDishActive(d.id).toPromise();
      this.notificationService.success('Sucesso', `Prato ${d.active ? 'desativado' : 'ativado'}`);
      this.dish.update(d => ({ ...d!, active: !d!.active }));
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível alterar o status');
    }
  }

  openDeleteConfirm(): void {
    this.deleteConfirmOpen.set(true);
  }

  async confirmDelete(): Promise<void> {
    const d = this.dish();
    if (!d) return;

    this.deleting.set(true);
    try {
      await this.apiService.deleteDish(d.id).toPromise();
      this.notificationService.success('Sucesso', 'Prato excluído');
      this.router.navigate(['/dishes']);
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível excluir o prato');
    } finally {
      this.deleting.set(false);
    }
  }

  onLightboxOpen(urls: string[]): void {
    // Could implement lightbox
  }
}