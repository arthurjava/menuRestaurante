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
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { ButtonComponent } from "../button/button.component";

export interface CategoryFormData {
  name: string;
  description: string;
  active: boolean;
  displayOrder: number;
  displayInMenu: boolean;
}

@Component({
  selector: "app-cat-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ButtonComponent,
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
              <div class="space-y-4">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Nome</mat-label>
                  <input
                    matInput
                    formControlName="name"
                    placeholder="Ex: Pratos Principais"
                    maxlength="100"
                  />
                  @if (form.get("name")?.touched && form.get("name")?.errors) {
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
                  <mat-label>Descrição</mat-label>
                  <input
                    matInput
                    formControlName="description"
                    placeholder="Descrição da categoria"
                    maxlength="500"
                  />
                  @if (
                    form.get("description")?.touched &&
                    form.get("description")?.errors?.["maxlength"]
                  ) {
                    <mat-error
                      >Descrição deve ter no máximo 500 caracteres</mat-error
                    >
                  }
                </mat-form-field>

                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      formControlName="active"
                      class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span class="text-sm text-gray-600">Categoria ativa</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      formControlName="displayInMenu"
                      class="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span class="text-sm text-gray-600"
                      >Exibir no cardápio público</span
                    >
                  </label>
                </div>

                <div>
                  <label class="label">Ordem de exibição</label>
                  <mat-form-field appearance="outline" class="w-24">
                    <input
                      matInput
                      type="number"
                      formControlName="displayOrder"
                      min="0"
                      step="1"
                    />
                  </mat-form-field>
                </div>
              </div>
            </form>
          </div>

          <div
            class="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl"
          >
            <app-button
              variant="secondary"
              [label]="'Cancelar'"
              (clicked)="cancel()"
            >
            </app-button>
            <app-button
              variant="primary"
              [label]="confirmLabel()"
              [loading]="confirmLoading()"
              (clicked)="onSubmit()"
            >
            </app-button>
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
export class CatFormComponent {
  isOpen = input<boolean>(false);
  isOpenChange = output<boolean>();
  title = input<string>("Nova Categoria");
  description = input<string>(
    "Preencha os dados para criar uma nova categoria",
  );
  confirmLabel = input<string>("Criar categoria");
  confirmLoading = input<boolean>(false);
  initialData = input<CategoryFormData | null>(null);
  size = input<"sm" | "md" | "lg" | "xl" | "full">("md");

  confirmed = output<CategoryFormData>();
  cancelled = output<void>();

  private _wasOpen = signal(false);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ["", [Validators.required, Validators.maxLength(100)]],
    description: ["", [Validators.maxLength(500)]],
    active: [true],
    displayOrder: [0, [Validators.min(0)]],
    displayInMenu: [true],
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
          active: true,
          displayOrder: 0,
          displayInMenu: true,
        });
      }
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
    this.confirmed.emit(this.form.value as CategoryFormData);
  }

  onAnimationDone(event: any): void {
    // Animation callback if needed
  }
}
