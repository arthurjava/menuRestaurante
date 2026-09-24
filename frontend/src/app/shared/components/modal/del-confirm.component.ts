import {
  Component,
  input,
  output,
  computed,
  effect,
  signal,
  ChangeDetectionStrategy,
  HostBinding,
} from "@angular/core";
import { trigger, transition, style, animate } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { ButtonComponent } from "../button/button.component";
@Component({
  selector: "app-del-confirm",
  standalone: true,
  imports: [CommonModule, MatButtonModule, ButtonComponent],
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
              @if (icon()) {
                <div class="flex items-center gap-2">
                  <h2 class="text-lg font-semibold text-gray-900">
                    {{ title() }}
                  </h2>
                </div>
              } @else {
                <h2 class="text-lg font-semibold text-gray-900">
                  {{ title() }}
                </h2>
              }
              @if (description()) {
                <p class="text-sm text-gray-500 mt-0.5">{{ description() }}</p>
              }
            </div>
          </div>

          <div class="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <ng-content></ng-content>
          </div>
          @if (showFooter()) {
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
                (clicked)="confirm()"
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
    `,
  ],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("0.2s ease-out", style({ opacity: 1 })),
      ]),
      transition(":leave", [animate("0.2s ease-out", style({ opacity: 0 }))]),
    ]),
    trigger("slideUp", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateY(20px) scale(0.95)" }),
        animate(
          "0.2s ease-out",
          style({ opacity: 1, transform: "translateY(0) scale(1)" }),
        ),
      ]),
      transition(":leave", [
        animate(
          "0.2s ease-out",
          style({ opacity: 0, transform: "translateY(20px) scale(0.95)" }),
        ),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelConfirmComponent {
  isOpen = input<boolean>(false);
  isOpenChange = output<boolean>();
  title = input<string>("Confirmar");
  description = input<string>("");
  icon = input<string>("warning");
  iconColor = input<string>("text-yellow-600");
  confirmLabel = input<string>("Confirmar");
  confirmVariant = input<"primary" | "danger" | "secondary">("primary");
  confirmLoading = input<boolean>(false);
  cancelLabel = input<string>("Cancelar");
  size = input<"sm" | "md" | "lg" | "xl" | "full">("sm");
  showFooter = input<boolean>(true);
  confirmed = output<void>();
  cancelled = output<void>();
  private _wasOpen = signal(false);
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
  confirm(): void {
    this.confirmed.emit();
  }
  onAnimationDone(event: any): void {
    // Animation callback if needed
  }
}
