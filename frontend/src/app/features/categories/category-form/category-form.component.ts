import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';
import { Category, CategoryRequest } from '../../../core/models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ImageUploadComponent, ImageFile } from '../../../shared/components/image-upload/image-upload.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface CategoryFormValue {
  name: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  active: boolean;
}

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent, ImageUploadComponent, LoadingSpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title">{{ isEditing() ? 'Editar' : 'Nova' }} Categoria</h1>
          <p class="page-subtitle">{{ isEditing() ? 'Atualize as informações da categoria' : 'Crie uma nova categoria para o cardápio' }}</p>
        </div>
        <app-button variant="secondary" routerLink="/categories">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Voltar
        </app-button>
      </div>

      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="card p-6 space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="lg:col-span-2">
            <app-input
              id="name"
              label="Nome da categoria"
              placeholder="Ex: Entradas, Pratos Principais, Sobremesas"
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
              placeholder="Descreva brevemente esta categoria..."
              [formControl]="descriptionControl"
              [error]="descriptionError()"
              [submitted]="submitted()"
              type="textarea"
              [rows]="3"
            ></app-input>
          </div>

          <div>
            <label class="form-label">Imagem da categoria</label>
            <app-image-upload
              [images]="imageFiles()"
              [maxFiles]="1"
              [allowPrimary]="false"
              (imagesChange)="onImageChange($event)"
            ></app-image-upload>
          </div>

          <div>
            <app-input
              id="displayOrder"
              label="Ordem de exibição"
              type="number"
              [formControl]="displayOrderControl"
              [error]="displayOrderError()"
              [submitted]="submitted()"
              [appNumberOnly]="true"
            ></app-input>
          </div>
        </div>

        <div class="flex items-center gap-4 pt-4 border-t border-gray-200">
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" formControlName="active" class="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
            <span class="ml-2 text-sm text-gray-700">Categoria ativa (visível no cardápio)</span>
          </label>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <app-button type="button" variant="secondary" routerLink="/categories">Cancelar</app-button>
          <app-button type="submit" variant="primary" [loading]="loading()">
            {{ isEditing() ? 'Atualizar' : 'Criar' }} Categoria
          </app-button>
        </div>
      </form>
    </div>
  `
})
export class CategoryFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(NonNullableFormBuilder);
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  loadingService = inject(LoadingService);

  categoryId = signal<string | null>(null);
  isEditing = computed(() => !!this.categoryId());
  loading = signal(false);
  submitted = signal(false);
  imageFiles = signal<ImageFile[]>([]);

  categoryForm: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    imageUrl: FormControl<string>;
    displayOrder: FormControl<number>;
    active: FormControl<boolean>;
  }> = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    description: this.fb.control('', [Validators.maxLength(1000)]),
    imageUrl: this.fb.control(''),
    displayOrder: this.fb.control(0, [Validators.min(0)]),
    active: this.fb.control(true)
  });

  get nameControl(): FormControl<string> {
    return this.categoryForm.controls.name;
  }

  get descriptionControl(): FormControl<string> {
    return this.categoryForm.controls.description;
  }

  get displayOrderControl(): FormControl<number> {
    return this.categoryForm.controls.displayOrder;
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.categoryId.set(id);
      await this.loadCategory(id);
    }
  }

  async loadCategory(id: string): Promise<void> {
    try {
      const category = await this.apiService.getCategory(id).toPromise();
      if (category) {
        this.categoryForm.patchValue({
          name: category.name,
          description: category.description || '',
          imageUrl: category.imageUrl || '',
          displayOrder: category.displayOrder,
          active: category.active
        });
        if (category.imageUrl) {
          this.imageFiles.set([{ file: new File([], ''), preview: category.imageUrl, primary: true }]);
        }
      }
    } catch (error) {
      this.notificationService.error('Erro', 'Não foi possível carregar a categoria');
      this.router.navigate(['/categories']);
    }
  }

  onImageChange(files: ImageFile[]): void {
    this.imageFiles.set(files);
    this.categoryForm.patchValue({ imageUrl: files[0]?.preview || '' });
  }

  nameError = computed(() => {
    const control = this.categoryForm.get('name');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['required']) return 'Nome é obrigatório';
      if (control.errors['maxlength']) return 'Nome deve ter no máximo 100 caracteres';
    }
    return '';
  });

  descriptionError = computed(() => {
    const control = this.categoryForm.get('description');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['maxlength']) return 'Descrição deve ter no máximo 1000 caracteres';
    }
    return '';
  });

  displayOrderError = computed(() => {
    const control = this.categoryForm.get('displayOrder');
    if (control?.errors && (control.touched || this.submitted())) {
      if (control.errors['min']) return 'Ordem deve ser maior ou igual a 0';
    }
    return '';
  });

  async onSubmit(): Promise<void> {
    this.submitted.set(true);

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      const formValue = this.categoryForm.getRawValue();
      const data: CategoryRequest = {
        name: formValue.name,
        description: formValue.description || '',
        imageUrl: formValue.imageUrl || '',
        displayOrder: formValue.displayOrder
      };

      if (this.isEditing()) {
        await this.apiService.updateCategory(this.categoryId()!, data).toPromise();
        this.notificationService.success('Sucesso', 'Categoria atualizada');
      } else {
        await this.apiService.createCategory(data).toPromise();
        this.notificationService.success('Sucesso', 'Categoria criada');
      }

      this.router.navigate(['/categories']);
    } catch (error: any) {
      this.notificationService.error('Erro', error.error?.error || 'Não foi possível salvar a categoria');
    } finally {
      this.loading.set(false);
    }
  }
}