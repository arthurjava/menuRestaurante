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
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { BadgeComponent, BadgeVariant } from "../badge/badge.component";
import { ButtonComponent } from "../button/button.component";

export interface ReorderItem {
  id: string;
  name: string;
  displayOrder: number;
  active: boolean;
  subtitle?: string;
}

export interface ReorderModalConfig {
  title: string;
  description: string;
  confirmLabel: string;
  emptyMessage: string;
  getItemSubtitle?: (item: ReorderItem) => string;
  getItemStatus?: (item: ReorderItem) => {
    label: string;
    variant: BadgeVariant;
  };
}

@Component({
  selector: "app-reorder-list",
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    BadgeComponent,
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
              @if (description()) {
                <p class="text-sm text-gray-500 mt-0.5">{{ description() }}</p>
              }
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
            @if (items().length === 0) {
              <div class="text-center py-8 text-gray-500">
                <mat-icon class="text-3xl mb-2">drag_indicator</mat-icon>
                <p>{{ config().emptyMessage }}</p>
              </div>
            } @else {
              <div
                cdkDropList
                (cdkDropListDropped)="onDrop($event)"
                class="space-y-2"
              >
                @for (item of items(); track item.id; let i = $index) {
                  <div
                    class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cdk-drag"
                  >
                    <mat-icon class="text-gray-400 cursor-grab"
                      >drag_indicator</mat-icon
                    >
                    <span class="font-medium">{{ i + 1 }}</span>
                    <span class="flex-1">{{ item.name }}</span>
                    @if (item.subtitle) {
                      <span class="text-sm text-gray-500">{{
                        item.subtitle
                      }}</span>
                    }
                    @if (config().getItemStatus) {
                      <app-badge
                        [label]="config().getItemStatus!(item).label"
                        [variant]="config().getItemStatus!(item).variant"
                        size="sm"
                      >
                      </app-badge>
                    }
                  </div>
                }
              </div>
            }
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
              [disabled]="items().length === 0"
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

      .cdk-drag-preview {
        @apply shadow-lg-custom bg-white;
      }

      .cdk-drag-placeholder {
        @apply opacity-0;
      }

      .cdk-drag-animating {
        @apply transition-transform duration-200;
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
export class ReorderWrapperComponent {
  isOpen = input<boolean>(false);
  isOpenChange = output<boolean>();
  title = input<string>("Reordenar Itens");
  description = input<string>("Arraste e solte para definir a ordem");
  confirmLabel = input<string>("Salvar ordem");
  confirmLoading = input<boolean>(false);
  items = input<ReorderItem[]>([]);
  config = input<ReorderModalConfig>({
    title: "Reordenar Itens",
    description: "Arraste e solte para definir a ordem",
    confirmLabel: "Salvar ordem",
    emptyMessage: "Nenhum item para reordenar",
  });
  size = input<"sm" | "md" | "lg" | "xl" | "full">("lg");

  confirmed = output<ReorderItem[]>();
  cancelled = output<void>();

  private _wasOpen = signal(false);
  private _internalItems = signal<ReorderItem[]>([]);

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

    // Sync internal items with input
    effect(() => {
      this._internalItems.set(this.items());
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
    this.confirmed.emit(this._internalItems());
  }

  onDrop(event: CdkDragDrop<ReorderItem[]>): void {
    const updated = [...this._internalItems()];
    moveItemInArray(updated, event.previousIndex, event.currentIndex);
    this._internalItems.set(
      updated.map((item, index) => ({ ...item, displayOrder: index })),
    );
  }

  onAnimationDone(event: any): void {
    // Animation callback if needed
  }
}
