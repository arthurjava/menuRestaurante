import {
  Component,
  input,
  output,
  signal,
  effect,
  computed,
  ChangeDetectionStrategy,
  HostBinding,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTabsModule } from "@angular/material/tabs";
import { ButtonComponent } from "../button/button.component";
import { InputComponent } from "../input/input.component";
import { SelectComponent } from "../select/select.component";
import {
  ImageUploadComponent,
  ImageFile,
} from "../image-upload/image-upload.component";
import {
  ImageUploadService,
  UploadedImage,
} from "../../../core/services/image-upload.service";
export interface DishFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  active: boolean;
  displayOrder: number;
}
export interface CategoryOption {
  value: string;
  label: string;
}
@Component({
  selector: "app-dish-modal",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatTabsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    ImageUploadComponent,
  ],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto" @fadeIn>
      <div class="flex min-h-full items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          (click)="onBackdropClick()"
        ></div>

        <!-- Modal Container -->
        <div
          class="relative w-full max-w-4xl bg-white rounded-xl shadow-xl transform transition-all max-h-[90vh]"
          @slideUp
        >
          <div
            class="flex items-center justify-between p-4 border-b border-gray-100"
          >
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-semibold text-gray-900">
                  {{ title() }}
                </h2>
              </div>
              <p class="text-sm text-gray-500 mt-0.5">{{ description() }}</p>
            </div>
            <button
              type="button"
              class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              (click)="cancel()"
              aria-label="Fechar modal"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>

          <form [formGroup]="form" class="p-0" (ngSubmit)="onSubmit()">
            <mat-tab-group animationDuration="200ms" class="w-full">
              <!-- Basic Info Tab -->
              <mat-tab label="Informações Básicas">
                <div
                  class="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <app-input
                      formControlName="name"
                      label="Nome do Prato *"
                      type="text"
                      placeholder="Ex: Salmão Grelhado"
                      [error]="nameError()"
                    >
                    </app-input>

                    <app-select
                      formControlName="categoryId"
                      label="Categoria *"
                      [options]="categoryOptions()"
                      placeholder="Selecione a categoria"
                      [error]="categoryError()"
                    >
                    </app-select>
                  </div>

                  <div>
                    <label class="label">Descrição</label>
                    <textarea
                      formControlName="description"
                      class="input min-h-[100px] resize-y"
                      placeholder="Descreva o prato, ingredientes, modo de preparo..."
                    >
                    </textarea>
                    @if (descriptionError()) {
                      <p class="text-sm text-red-600 mt-1">
                        {{ descriptionError() }}
                      </p>
                    }
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label class="label">Preço (R$) *</label>
                      <input
                        type="number"
                        formControlName="price"
                        class="input"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                      />
                      @if (priceError()) {
                        <p class="text-sm text-red-600 mt-1">
                          {{ priceError() }}
                        </p>
                      }
                    </div>

                    <div>
                      <label class="label">Ordem de exibição</label>
                      <input
                        type="number"
                        formControlName="displayOrder"
                        class="input"
                        min="0"
                        step="1"
                      />
                    </div>

                    <div class="flex items-end">
                      <label
                        class="flex items-center gap-2 cursor-pointer w-full"
                      >
                        <mat-slide-toggle
                          formControlName="active"
                          class="w-auto"
                        ></mat-slide-toggle>
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
                    [dishId]="dishId()"
                    [maxFiles]="5"
                    [maxFileSizeMB]="5"
                    [existingImages]="existingImages()"
                    (imagesChange)="onImagesChange($event)"
                    (uploadComplete)="onImagesUploadComplete($event)"
                    (uploadError)="onImageError($event)"
                  >
                  </app-image-upload>
                </div>
              </mat-tab>
            </mat-tab-group>

            <div
              class="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl"
            >
              <app-button
                variant="secondary"
                label="Cancelar"
                (clicked)="cancel()"
              >
              </app-button>
              <app-button
                variant="primary"
                [label]="confirmLabel()"
                [loading]="confirmLoading()"
                [disabled]="form.invalid || confirmLoading()"
                type="submit"
                (clicked)="onSubmit()"
              >
              </app-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      :host(.hidden) {
        display: none;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .fade-in {
        animation: fadeIn 0.2s ease-out;
      }
      .slide-up {
        animation: slideUp 0.2s ease-out;
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
  animations: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishModalComponent {
  // State
  isOpen = input<boolean>(false);
  isOpenChange = output<boolean>();
  // Content
  title = input<string>("Novo Prato");
  description = input<string>("Preencha os dados para criar um novo prato");
  confirmLabel = input<string>("Criar prato");
  confirmLoading = input<boolean>(false);
  // Data
  categoryOptions = input<CategoryOption[]>([]);
  existingImages = input<UploadedImage[]>([]);
  dishId = input<string>("");
  // Events
  confirmed = output<DishFormData>();
  cancelled = output<void>();
  closed = output<void>();
  imagesChange = output<ImageFile[]>();
  imagesUploadComplete = output<UploadedImage[]>();
  imageError = output<string>();
  private fb = inject(FormBuilder);
  private _wasOpen = signal(false);
  form: FormGroup = this.fb.group({
    name: ["", [Validators.required, Validators.maxLength(100)]],
    description: ["", [Validators.maxLength(1000)]],
    price: [0, [Validators.required, Validators.min(0)]],
    categoryId: ["", [Validators.required]],
    active: [true],
    displayOrder: [0, [Validators.min(0)]],
  });
  @HostBinding("class.hidden")
  get isHidden(): boolean {
    return !this.isOpen();
  }
  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open !== this._wasOpen()) {
        this._wasOpen.set(open);
        this.isOpenChange.emit(open);
      }
    });
  }
  onBackdropClick(): void {
    this.cancel();
  }
  cancel(): void {
    this.cancelled.emit();
    this.close();
  }
  close(): void {
    this.isOpenChange.emit(false);
    this.closed.emit();
  }
  onSubmit(): void {
    if (this.form.invalid || this.confirmLoading()) return;
    this.confirmed.emit(this.form.value as DishFormData);
  }
  onImagesChange(images: ImageFile[]): void {
    this.imagesChange.emit(images);
  }
  onImagesUploadComplete(images: UploadedImage[]): void {
    this.imagesUploadComplete.emit(images);
  }
  onImageError(error: string): void {
    this.imageError.emit(error);
  }
  nameError = computed(() => {
    const control = this.form.get("name");
    if (control?.touched && control?.errors) {
      if (control.errors["required"]) return "Nome é obrigatório";
      if (control.errors["maxlength"])
        return "Nome deve ter no máximo 100 caracteres";
    }
    return "";
  });
  descriptionError = computed(() => {
    const control = this.form.get("description");
    if (control?.touched && control?.errors?.["maxlength"]) {
      return "Descrição deve ter no máximo 1000 caracteres";
    }
    return "";
  });
  priceError = computed(() => {
    const control = this.form.get("price");
    if (control?.touched && control?.errors) {
      if (control.errors["required"]) return "Preço é obrigatório";
      if (control.errors["min"]) return "Preço deve ser maior ou igual a zero";
    }
    return "";
  });
  categoryError = computed(() => {
    const control = this.form.get("categoryId");
    if (control?.touched && control?.errors?.["required"]) {
      return "Categoria é obrigatória";
    }
    return "";
  });
}
