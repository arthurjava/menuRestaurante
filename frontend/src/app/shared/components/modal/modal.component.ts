import {
  Component,
  input,
  output,
  computed,
  effect,
  signal,
  ChangeDetectionStrategy,
  HostBinding,
  TemplateRef,
  inject,
} from "@angular/core";
import { trigger, transition, style, animate } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { ButtonComponent } from "../button/button.component";
import { CatFormComponent, CategoryFormData } from "./cat-form.component";
import { DelConfirmComponent } from "./del-confirm.component";
import {
  ReorderWrapperComponent,
  ReorderItem,
  ReorderModalConfig,
} from "./reorder-wrapper.component";
import {
  DishFormComponent,
  DishFormData,
  CategoryOption,
} from "./dish-form.component";
import {
  UserFormComponent,
  UserFormData,
  RoleOption,
} from "./user-form.component";
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
export type ModalVariant =
  | "default"
  | "category-form"
  | "confirm"
  | "reorder"
  | "dish-form"
  | "user-form";
@Component({
  selector: "app-modal",
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    ButtonComponent,
    CatFormComponent,
    DelConfirmComponent,
    ReorderWrapperComponent,
    DishFormComponent,
    UserFormComponent,
  ],
  template: `
    <div
      class="fixed inset-0 z-60 overflow-y-auto"
      @fadeIn
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="title() ? 'modal-title' : null"
      [attr.aria-describedby]="description() ? 'modal-description' : null"
    >
      <div class="flex min-h-full items-center justify-center p-4">
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-fast"
          (click)="onBackdropClick()"
          aria-hidden="true"
        ></div>

        <!-- Modal Container -->
        <div
          class="relative w-full bg-surface-primary rounded-2xl shadow-modal transform transition-all"
          [class]="modalSizeClass()"
          @slideUp
        >
          @if (showHeader()) {
            <div
              class="flex items-start justify-between p-4 pb-2 border-b border-border"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h2
                    id="modal-title"
                    class="text-h4 font-semibold text-text-primary"
                  >
                    {{ title() }}
                  </h2>
                </div>
                @if (description()) {
                  <p
                    id="modal-description"
                    class="text-body-sm text-text-secondary mt-1"
                  >
                    {{ description() }}
                  </p>
                }
              </div>
              @if (closable()) {
                <button
                  type="button"
                  class="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors duration-fast"
                  (click)="close()"
                  aria-label="Fechar modal"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              }
            </div>
          }
          <div class="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            @if (variant() === "default") {
              @if (contentTemplate()) {
                <ng-template
                  [ngTemplateOutlet]="contentTemplate()"
                ></ng-template>
              }
            }
            @if (variant() === "category-form") {
              <app-cat-form
                [confirmLabel]="confirmLabel()"
                [confirmLoading]="confirmLoading()"
                [initialData]="categoryInitialData()"
                (confirmed)="categoryConfirmed.emit($event)"
                (cancelled)="cancel()"
              >
              </app-cat-form>
            }
            @if (variant() === "confirm") {
              <app-del-confirm
                [description]="description()"
                [confirmLabel]="confirmLabel()"
                [confirmVariant]="confirmVariant()"
                [confirmLoading]="confirmLoading()"
                [cancelLabel]="cancelLabel()"
                (confirmed)="confirmed.emit()"
                (cancelled)="cancel()"
              >
              </app-del-confirm>
            }
            @if (variant() === "reorder") {
              <app-reorder-list
                [items]="reorderItemsInput()"
                [config]="reorderConfig()"
                [confirmLoading]="confirmLoading()"
                (confirmed)="reorderConfirmed.emit($event)"
                (cancelled)="cancel()"
              >
              </app-reorder-list>
            }
            @if (variant() === "dish-form") {
              <app-dish-form
                [confirmLabel]="confirmLabel()"
                [confirmLoading]="confirmLoading()"
                [categoryOptions]="dishCategoryOptions()"
                [initialData]="dishInitialData()"
                (confirmed)="dishConfirmed.emit($event)"
                (cancelled)="cancel()"
              >
              </app-dish-form>
            }
            @if (variant() === "user-form") {
              <app-user-form
                [confirmLabel]="confirmLabel()"
                [confirmLoading]="confirmLoading()"
                [roleOptions]="userRoleOptions()"
                [initialData]="userInitialData()"
                [editing]="userEditing()"
                (confirmed)="userConfirmed.emit($event)"
                (cancelled)="cancel()"
              >
              </app-user-form>
            }
          </div>
          @if (showFooter()) {
            <div
              class="flex items-center justify-end gap-3 px-4 py-3 border-t border-border bg-surface-secondary rounded-b-2xl"
            >
              @if (cancelLabel()) {
                <app-button
                  variant="secondary"
                  [label]="cancelLabel()"
                  (clicked)="cancel()"
                >
                </app-button>
              }
              <app-button
                [variant]="confirmVariant()"
                [label]="confirmLabel()"
                [loading]="confirmLoading()"
                [disabled]="isConfirmDisabled()"
                (clicked)="onConfirmClick()"
              >
              </app-button>
            </div>
          }
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
    `,
  ],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("150ms ease-out", style({ opacity: 1 })),
      ]),
      transition(":leave", [animate("150ms ease-out", style({ opacity: 0 }))]),
    ]),
    trigger("slideUp", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(20px) scale(0.95)" }),
        animate(
          "200ms ease-out",
          style({ opacity: 1, transform: "translateY(0) scale(1)" }),
        ),
      ]),
      transition(":leave", [
        animate(
          "150ms ease-out",
          style({ opacity: 0, transform: "translateY(20px) scale(0.95)" }),
        ),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  // State
  isOpen = input<boolean>(false);
  isOpenChange = output<boolean>();
  // Content
  title = input<string>("");
  description = input<string>("");
  icon = input<string>("");
  iconColor = input<string>("text-brand-primary");
  contentTemplate = input<TemplateRef<unknown> | null>(null);
  // Variant
  variant = input<ModalVariant>("default");
  // Header/Footer
  showHeader = input<boolean>(true);
  showFooter = input<boolean>(true);
  closable = input<boolean>(true);
  // Footer actions
  cancelLabel = input<string>("Cancelar");
  confirmLabel = input<string>("Confirmar");
  confirmVariant = input<"primary" | "danger" | "secondary">("primary");
  confirmLoading = input<boolean>(false);
  confirmDisabled = input<boolean>(false);
  // Size
  size = input<ModalSize>("md");
  // Category form data
  categoryInitialData = input<CategoryFormData | null>(null);
  // Confirm variant data
  confirmIcon = input<string>("warning");
  confirmIconColor = input<string>("text-state-warning");
  // Reorder variant data
  reorderItemsInput = input<ReorderItem[]>([]);
  reorderConfig = input<ReorderModalConfig>({
    title: "Reordenar Itens",
    description: "Arraste e solte para definir a ordem",
    confirmLabel: "Salvar ordem",
    emptyMessage: "Nenhum item para reordenar",
  });
  // Dish form data
  dishCategoryOptions = input<CategoryOption[]>([]);
  dishInitialData = input<DishFormData | null>(null);
  // User form data
  userRoleOptions = input<RoleOption[]>([
    { value: "ADMIN", label: "Administrador" },
    { value: "MANAGER", label: "Gerente" },
    { value: "STAFF", label: "Funcionário" },
  ]);
  userInitialData = input<UserFormData | null>(null);
  userEditing = input<boolean>(false);
  // Events
  confirmed = output<void>();
  cancelled = output<void>();
  closed = output<void>();
  categoryConfirmed = output<CategoryFormData>();
  dishConfirmed = output<DishFormData>();
  userConfirmed = output<UserFormData>();
  reorderConfirmed = output<ReorderItem[]>();
  private _wasOpen = signal(false);
  @HostBinding("class.hidden")
  get isHidden(): boolean {
    return !this.isOpen();
  }
  modalSizeClass = computed(() => {
    const sizes: Record<ModalSize, string> = {
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
  }
  onBackdropClick(): void {
    if (this.closable()) {
      this.cancel();
    }
  }
  cancel(): void {
    this.cancelled.emit();
    this.close();
  }
  close(): void {
    this.isOpenChange.emit(false);
    this.closed.emit();
  }
  onConfirmClick(): void {
    switch (this.variant()) {
      case "category-form":
      case "dish-form":
      case "user-form":
      case "reorder":
        // Handled by child components
        break;
      default:
        this.confirm();
    }
  }
  confirm(): void {
    this.confirmed.emit();
  }
  isConfirmDisabled = computed(() => {
    return this.confirmDisabled() || this.confirmLoading();
  });
}
