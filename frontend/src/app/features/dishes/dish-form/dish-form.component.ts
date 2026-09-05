import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, NonNullableFormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { Dish, Category, DishRequest, DishImage } from '../../../core/models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { SelectComponent } from '../../../shared/components/select/select.component';
import { ImageUploadComponent, ImageFile } from '../../../shared/components/image-upload/image-upload.component';
import { ImageGalleryComponent } from '../../../shared/components/image-gallery/image-gallery.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';

interface DishFormValue {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  prepTimeMinutes: string;
  calories: string;
  allergens: string;
  imageUrl: string;
  active: boolean;
}

@Component({
  selector: 'app-dish-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent, SelectComponent, ImageUploadComponent, ImageGalleryComponent, LoadingSpinnerComponent, CurrencyBrlPipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title">{{ isEditing() ? 'Editar' : 'Novo' }} Prato</h1>
          <p class="page-subtitle">{{ isEditing() ? 'Atualize as informações do prato' : 'Crie um novo prato para o cardápio' }}</p>
        </div>
        <app-button variant="secondary" routerLink="/dishes">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Voltar
        </app-button>
      </div>

      <form [formGroup]="dishForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="card p-6 space-y-6">
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Informações Básicas</h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="lg:col-span-2">
              <app-input
                id="name"
                label="Nome do prato"
                placeholder="Ex: Risoto de Camarão"
                [formControl]="nameControl"
                [error]="nameError()"
                [submitted]="submitted()"
                [required]="true"
              ></app-input>
            </div>

            <div class="lg:col-span-2">
              <app-input
                id="description"
                label="Descrição"
                placeholder="Descreva os ingredientes e preparo..."
                [formControl]="descriptionControl"
                [error]="descriptionError()"
                [submitted]="submitted()"
                type="textarea"
                [rows]="4"
              ></app-input>
            </div>

            <div>
              <app-input
                id="price"
                label="Preço (R$)"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                [formControl]="priceControl"
                [error]="priceError()"
                [submitted]="submitted()"
                [required]="true"
                [appNumberOnly]="true"
                [allowDecimal]="true"
              ></app-input>
            </div>

            <div>
              <app-select
                id="categoryId"
                label="Categoria"
                placeholder="Selecione uma categoria"
                [options]="categoryOptions()"
                [formControl]="categoryIdControl"
                [error]="categoryError()"
                [submitted]="submitted()"
                [required]="true"
              ></app-select>
            </div>

            <div>
              <app-input
                id="prepTimeMinutes"
                label="Tempo de preparo (minutos)"
                type="number"
                min="1"
                placeholder="Ex: 30"
                [formControl]="prepTimeMinutesControl"
                [error]="prepTimeError()"
                [submitted]="submitted()"
                [appNumberOnly]="true"
              ></app-input>
            </div>

            <div>
              <app-input
                id="calories"
                label="Calorias (opcional)"
                type="number"
                min="0"
                placeholder="Ex: 450"
                [formControl]="caloriesControl"
                [error]="caloriesError()"
                [submitted]="submitted()"
                [appNumberOnly]="true"
              ></app-input>
            </div>

            <div class="lg:col-span-2">
              <app-input
                id="allergens"
                label="Alergênicos"
                placeholder="Ex: Glúten, Lactose, Crustáceos, Amendoim"
                [formControl]="allergensControl"
                [error]="allergensError()"
                [submitted]="submitted()"
              ></app-input>
            </div>
          </div>
        </div>

        <div class="card p-6 space-y-6">
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Imagens do Prato</h2>

          <app-image-upload
            [images]="imageFiles()"
            [maxFiles]="5"
            [allowPrimary]="true"
            [reorderable]="true"
            (imagesChange)="onImagesChange($event)"
            (primaryChange)="onPrimaryChange($event)"
            (reorder)="onReorder($event)"
          ></app-image-upload>

          @if (imageFiles().length > 0) {
            <div class="pt-4 border-t border-gray-200">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Pré-visualização</h3>
              <app-image-gallery
                [images]="galleryImages()"
                (imageSelect)="onGallerySelect($event)"
                (lightboxOpen)="onLightboxOpen($event)"
              ></app-image-gallery>
            </div>
          }
        </div>

        <div class="card p-6 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Status</h2>
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" formControlName="active" class="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
              <span class="ml-2 text-sm text-gray-700">Prato ativo (visível no cardápio)</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <app-button type="button" variant="secondary" routerLink="/dishes">Cancelar</app-button>
          <app-button type="submit" variant="primary" [loading]="loading()">
            {{ isEditing() ? 'Atualizar' : 'Criar' }} Prato
          </app-button>
        </div>
      </form>
    </div>
  `
})
export class DishFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private imageUploadService = inject(ImageUploadService);
  loadingService = inject(LoadingService);

  dishId = signal<string | null>(null);
  isEditing = computed(() => !!this.dishId());
  loading = signal(false);
  submitted = signal(false);
  savingImages = signal(false);
  imageFiles = signal<ImageFile[]>([]);
  existingImages = signal<DishImage[]>([]);

  categories = signal<Category[]>([]);

  dishForm = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(150)]),
    description: this.fb.control('', [Validators.maxLength(5000)]),
    price: this.fb.control(0, [Validators.required, Validators.min(0.01)]),
    categoryId: this.fb.control('', [Validators.required]),
    prepTimeMinutes: this.fb.control('', [Validators.min(1)]),
    calories: this.fb.control('', [Validators.min(0)]),
    allergens: this.fb.control('', [Validators.maxLength(500)]),
    imageUrl: this.fb.control(''),
    active: this.fb.control(true)
  });

  get nameControl(): FormControl<string> {
    return this.dishForm.controls.name as FormControl<string>;
  }

  get descriptionControl(): FormControl<string> {
    return this.dishForm.controls.description as FormControl<string>;
  }

  get priceControl(): FormControl<number> {
    return this.dishForm.controls.price as FormControl<number>;
  }

  get categoryIdControl(): FormControl<string> {
    return this.dishForm.controls.categoryId as FormControl<string>;
  }

  get prepTimeMinutesControl(): FormControl<string> {
    return this.dishForm.controls.prepTimeMinutes as FormControl<string>;
  }

  get caloriesControl(): FormControl<string> {
    return this.dishForm.controls.calories as FormControl<string>;
  }

  get allergensControl(): FormControl<string> {
    return this.dishForm.controls.allergens as FormControl<string>;
  }

  categoryOptions = computed(() => 
    this.categories().map(c => ({ value: c.id, label: c.name }))
  );

  galleryImages = computed(() => 
    this.imageFiles().map(f => ({ url: f.preview, alt: f.file.name, primary: f.primary }))
  );

  async ngOnInit(): Promise<void> {
    await this.loadCategories();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dishId.set(id);
      await this.loadDish(id);
    }
  }

  async loadCategories(): Promise<void> {
    try {
      const res = await this.apiService.getCategories().toPromise();
      this.categories.set(res || []);
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível carregar as categorias');
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
      this.dishForm.patchValue({
        name: dish.name,
        description: dish.description || '',
        price: dish.price,
        categoryId: dish.categoryId,
        prepTimeMinutes: dish.prepTimeMinutes != null ? String(dish.prepTimeMinutes) : '',
        calories: dish.calories != null ? String(dish.calories) : '',
        allergens: dish.allergens || '',
        imageUrl: dish.imageUrl || '',
        active: dish.active
      });

      if (dish.images && dish.images.length > 0) {
        this.existingImages.set(dish.images);
        this.imageFiles.set(dish.images.map(img => ({
          file: new File([], ''),
          preview: img.imageUrl,
          primary: img.primary,
          id: img.id
        })));
      }
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível carregar o prato');
      this.router.navigate(['/dishes']);
    }
  }

  onImagesChange(files: ImageFile[]): void {
    this.imageFiles.set(files);
    this.dishForm.patchValue({ imageUrl: files.find(f => f.primary)?.preview || files[0]?.preview || '' });
  }

  onPrimaryChange(index: number): void {
    this.dishForm.patchValue({ imageUrl: this.imageFiles()[index]?.preview || '' });
  }

  onReorder(files: ImageFile[]): void {
    this.imageFiles.set(files);
    this.dishForm.patchValue({ imageUrl: files.find(f => f.primary)?.preview || files[0]?.preview || '' });
  }

  onGallerySelect(index: number): void {
    // Could expand to full screen view
  }

  onLightboxOpen(urls: string[]): void {
    // Could open lightbox modal
  }

  nameError = computed(() => {
    const control = this.nameControl;
    if (control.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'Nome é obrigatório';
      if (control.errors['maxlength']) return 'Nome deve ter no máximo 150 caracteres';
    }
    return '';
  });

  descriptionError = computed(() => {
    const control = this.descriptionControl;
    if (control.errors && (control.touched || this.submitted())) {
      if (control.errors['maxlength']) return 'Descrição deve ter no máximo 5000 caracteres';
    }
    return '';
  });

  priceError = computed(() => {
    const control = this.priceControl;
    if (control.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'Preço é obrigatório';
      if (control.errors['min']) return 'Preço deve ser maior que zero';
    }
    return '';
  });

  categoryError = computed(() => {
    const control = this.categoryIdControl;
    if (control.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'Categoria é obrigatória';
    }
    return '';
  });

  prepTimeError = computed(() => {
    const control = this.prepTimeMinutesControl;
    if (control.errors && (control.touched || this.submitted())) {
      if (control.errors['min']) return 'Tempo deve ser maior que zero';
    }
    return '';
  });

  caloriesError = computed(() => {
    const control = this.caloriesControl;
    if (control.errors && (control.touched || this.submitted())) {
      if (control.errors['min']) return 'Calorias deve ser maior ou igual a zero';
    }
    return '';
  });

  allergensError = computed(() => {
    const control = this.allergensControl;
    if (control.errors && (control.touched || this.submitted())) {
      if (control.errors['maxlength']) return 'Alergênicos deve ter no máximo 500 caracteres';
    }
    return '';
  });

  async onSubmit(): Promise<void> {
    this.submitted.set(true);

    if (this.dishForm.invalid) {
      this.dishForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      const formValue = this.dishForm.getRawValue();
      const data: DishRequest = {
        name: formValue.name!,
        description: formValue.description || '',
        price: formValue.price!,
        categoryId: formValue.categoryId!,
        prepTimeMinutes: formValue.prepTimeMinutes ? Number(formValue.prepTimeMinutes) : undefined,
        calories: formValue.calories ? Number(formValue.calories) : undefined,
        allergens: formValue.allergens || '',
        imageUrl: formValue.imageUrl || ''
      };

      let dish: Dish;
      if (this.isEditing()) {
        const updatedDish = await this.apiService.updateDish(this.dishId()!, data).toPromise();
        if (!updatedDish) {
          throw new Error('Falha ao atualizar o prato');
        }
        dish = updatedDish;
        this.notificationService.success('Sucesso', 'Prato atualizado');
      } else {
        const createdDish = await this.apiService.createDish(data).toPromise();
        if (!createdDish) {
          throw new Error('Falha ao criar o prato');
        }
        dish = createdDish;
        this.notificationService.success('Sucesso', 'Prato criado');
      }

      // Upload images if any new ones
      const newFiles = this.imageFiles().filter(f => f.file && f.file.size > 0);
      if (newFiles.length > 0) {
        this.savingImages.set(true);
        try {
          const files = newFiles.map(f => f.file);
          await this.imageUploadService.uploadDishImages(dish.id, files).toPromise();
          this.notificationService.success('Sucesso', 'Imagens enviadas');
        } catch (error) {
          this.notificationService.error('Erro', 'Erro ao enviar imagens');
        } finally {
          this.savingImages.set(false);
        }
      }

      // Handle existing images reorder/primary
      if (this.existingImages().length > 0) {
        try {
          const imageOrders = this.imageFiles()
            .filter(f => f.id)
            .map((f, index) => ({ id: f.id!, displayOrder: index }));
          
          if (imageOrders.length > 0) {
            await this.imageUploadService.reorderDishImages(dish.id, imageOrders).toPromise();
          }
        } catch (error) {
          console.error('Erro ao reordenar imagens:', error);
        }
      }

      this.router.navigate(['/dishes']);
    } catch (error: any) {
      this.notificationService.error('Erro', error.error?.error || 'Não foi possível salvar o prato');
    } finally {
      this.loading.set(false);
    }
  }
}