import {
  Component,
  input,
  output,
  signal,
  effect,
  ChangeDetectionStrategy,
  HostBinding,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "../button/button.component";
export type ConfirmVariant = "primary" | "danger" | "secondary";
@Component({
  selector: "app-del-confirm",
  standalone: true,
  imports: [CommonModule, ButtonComponent],
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
          class="relative w-full max-w-sm bg-white rounded-xl shadow-xl transform transition-all"
          @slideUp
        >
          <div
            class="flex items-center justify-between p-4 border-b border-gray-100"
          >
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
            </div>
          </div>

          <div class="p-4">
            <p class="text-gray-600">{{ description() }}</p>
          </div>

          <div
            class="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl"
          >
            <app-button
              variant="secondary"
              [label]="cancelLabel()"
              (clicked)="cancel()"
            >
            </app-button>
            <app-button
              [variant]="confirmVariant()"
              [label]="confirmLabel()"
              [loading]="confirmLoading()"
              [disabled]="confirmLoading()"
              (clicked)="confirm()"
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
    `,
  ],
  animations: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelConfirmComponent {
  // State
  isOpen = input<boolean>(false);
  isOpenChange = output<boolean>();
  // Content
  title = input<string>("Confirmar Exclusão");
  description = input<string>(
    "Tem certeza que deseja excluir? Esta ação não pode ser desfeita.",
  );
  icon = input<string>("warning");
  iconColor = input<string>("text-yellow-600");
  confirmLabel = input<string>("Excluir");
  confirmVariant = input<ConfirmVariant>("danger");
  confirmLoading = input<boolean>(false);
  cancelLabel = input<string>("Cancelar");
  // Events
  confirmed = output<void>();
  cancelled = output<void>();
  closed = output<void>();
  private _wasOpen = signal(false);
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
  confirm(): void {
    if (this.confirmLoading()) return;
    this.confirmed.emit();
  }
}
