import {
  Component,
  input,
  output,
  computed,
  effect,
  signal,
  inject,
  ChangeDetectionStrategy,
  HostBinding,
} from "@angular/core";
import {
  trigger,
  transition,
  style,
  animate,
} from "@angular/animations";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ImageUploadComponent } from "../image-upload/image-upload.component";
import { UploadedImage } from "@core/services/image-upload.service";

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
  selector: "app-dish-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    ImageUploadComponent,
  ],
  template: `
    <div
      class="fixed inset-0 z-50 overflow-y-auto"
      [style.display]="isOpen() ? 'block' : 'none'"
    >
      <div class="flex min-h-full items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          (click)="onBackdropClick()"
          [@fadeIn]
        ></div>

        <!-- Modal Container -->
        <div
          class="relative w-full bg-white rounded-xl shadow-xl transform transition-all"
          [class]="modalSizeClass()"
          [@slideUp]
          (@slideUp.done)="onAnimationDone($event)"
        >
          <div
            class="flex items-center justify-between p-4 border-b border-gray-100"
          >
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
              <p class="text-sm text-gray-500 mt-0.5">{{ description() }}</p>
            </div>
            <button
              type="button"
              class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              (click)="close()"
              aria-label="Fechar modal"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <form [formGroup]="form" class="space-y-4">
              <mat-tab-group animationDuration="200ms" class="w-full">
                <!-- Basic Info Tab -->
                <mat-tab label="Informações Básicas">
                  <div class="p-4 space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Nome do Prato *</mat-label>
                        <input
                          matInput
                          formControlName="name"
                          placeholder="Ex: Salmão Grelhado"
                          maxlength="100"
                        />
                        @if (
                          form.get("name")?.touched && form.get("name")?.errors
                        ) {
                          <mat-error>
                            @if (form.get("name")?.errors?.["required"]) {
                              Nome é obrigatório
                            }
                            @if (form.get("name")?.errors?.["maxlength"]) {
                              Nome deve ter no máximo 100 caracteres
                            }
                          </mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Categoria *</mat-label>
                        <mat-select
                          formControlName="categoryId"
                          [compareWith]="compareById"
                        >
                          @for (opt of categoryOptions(); track opt.value) {
                            <mat-option [value]="opt.value">{{
                              opt.label
                            }}</mat-option>
                          }
                        </mat-select>
                        @if (
                          form.get("categoryId")?.touched &&
                          form.get("categoryId")?.errors?.["required"]
                        ) {
                          <mat-error>Categoria é obrigatória</mat-error>
                        }
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Descrição</mat-label>
                      <textarea
                        matInput
                        formControlName="description"
                        placeholder="Descreva o prato, ingredientes, modo de preparo..."
                        rows="4"
                        maxlength="1000"
                      ></textarea>
                      @if (
                        form.get("description")?.touched &&
                        form.get("description")?.errors?.["maxlength"]
                      ) {
                        <mat-error
                          >Descrição deve ter no máximo 1000
                          caracteres</mat-error
                        >
                      }
                    </mat-form-field>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Preço (R$) *</mat-label>
                        <input
                          matInput
                          type="number"
                          formControlName="price"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                        />
                        @if (
                          form.get("price")?.touched &&
                          form.get("price")?.errors
                        ) {
                          <mat-error>
                            @if (form.get("price")?.errors?.["required"]) {
                              Preço é obrigatório
                            }
                            @if (form.get("price")?.errors?.["min"]) {
                              Preço deve ser maior ou igual a zero
                            }
                          </mat-error>
                        }
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Ordem de exibição</mat-label>
                        <input
                          matInput
                          type="number"
                          formControlName="displayOrder"
                          min="0"
                          step="1"
                        />
                      </mat-form-field>

                      <div class="flex items-end">
                        <label
                          class="flex items-center gap-2 cursor-pointer w-full"
                        >
                          <mat-slide-toggle
                            formControlName="active"
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
                      [dishId]="editingDishId()"
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
            </form>
          </div>

          <div
            class="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl"
          >
            <button
              type="button"
              mat-stroked-button
              class="text-gray-600 hover:text-gray-900"
              (click)="cancel()"
            >
              Cancelar
            </button>
            <button
              type="button"
              mat-flat-button
              color="primary"
              [disabled]="form.invalid || confirmLoading()"
              (click)="onSubmit()"
            >
              @if (confirmLoading()) {
                <mat-spinner diameter="20" class="mr-2"></mat-spinner>
              }
              {{ confirmLabel() }}
            </button>
          </div>
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

      .modal-sm {
        @apply max-w-sm;
      }
      .modal-md {
        @apply max-w-md;
      }
      .modal-lg {
        @apply max-w-lg;
      }
      .modal-xl {
        @apply max-w-xl;
      }
      .modal-full {
        @apply max-w-4xl;
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

      :host ::ng-deep .mat-mdc-form-field {
        @apply w-full;
      }
    `,
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.2s ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate('0.2s ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('0.2s ease-out', style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishFormComponent {
  isOpen = input<boolean>(false);
  isOpenChange = output<boolean>();
  title = input<string>("Novo Prato");
  description = input<string>("Preencha os dados para criar um novo prato");
  confirmLabel = input<string>("Criar prato");
  confirmLoading = input<boolean>(false);
  categoryOptions = input<{ value: string; label: string }[]>([]);
  initialData = input<DishFormData | null>(null);
  existingImages = input<UploadedImage[]>([]);
  editingDishId = input<string>("");
  size = input<"sm" | "md" | "lg" | "xl" | "full">("xl");

  confirmed = output<DishFormData>();
  cancelled = output<void>();
  imagesChange = output<any[]>();
  uploadComplete = output<UploadedImage[]>();
  uploadError = output<string>();

  private _wasOpen = signal(false);
  private fb = inject(FormBuilder);

  form = this.fb.group({
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

  modalSizeClass = computed(() => {
    const sizes = {
      sm: "modal-sm",
      md: "modal-md",
      lg: "modal-lg",
      xl: "modal-xl",
      full: "modal-full",
    };
    return sizes[this.size()];
  });

  compareById = (a: string, b: string) => a === b;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open !== this._wasOpen()) {
        this._wasOpen.set(open);
        this.isOpenChange.emit(open);
      }
    });

    effect(() => {
      const data = this.initialData();
      if (data && this.isOpen()) {
        this.form.patchValue(data);
      } else if (!data && this.isOpen()) {
        this.form.reset({
          name: "",
          description: "",
          price: 0,
          categoryId: "",
          active: true,
          displayOrder: 0,
        });
      }
    });

    effect(() => {
      const images = this.existingImages();
      // Images are handled by the image-upload component
    });
  }

  onBackdropClick(): void {
    this.close();
  }

  close(): void {
    this.isOpenChange.emit(false);
    this.cancelled.emit();
  }

  cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  onSubmit(): void {
    if (this.form.invalid || this.confirmLoading()) return;
    this.confirmed.emit(this.form.value as DishFormData);
  }

  onImagesChange(images: any[]): void {
    this.imagesChange.emit(images);
  }

  onImagesUploadComplete(images: UploadedImage[]): void {
    this.uploadComplete.emit(images);
  }

  onImageError(error: string): void {
    this.uploadError.emit(error);
  }

  onAnimationDone(event: any): void {
    // Animation callback if needed
  }
}
