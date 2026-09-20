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
  Type,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatBadgeModule } from "@angular/material/badge";
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { ButtonComponent } from "../button/button.component";
import { BadgeComponent } from "../badge/badge.component";

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
  getItemIcon?: (item: ReorderItem) => string;
  getItemSubtitle?: (item: ReorderItem) => string;
  getItemStatus?: (item: ReorderItem) => {
    label: string;
    variant: "success" | "gray" | "warning" | "danger";
  };
}

@Component({
  selector: "app-reorder-modal",
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    DragDropModule,
    ButtonComponent,
    BadgeComponent,
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
          class="relative w-full max-w-lg bg-white rounded-xl shadow-xl transform transition-all"
          @slideUp
        >
          <div
            class="flex items-center justify-between p-4 border-b border-gray-100"
          >
            <div>
              <h2 class="text-lg font-semibold text-gray-900">
                {{ config().title }}
              </h2>
              <p class="text-sm text-gray-500 mt-0.5">
                {{ config().description }}
              </p>
            </div>
            <button
              type="button"
              class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              (click)="cancel()"
              aria-label="Fechar modal"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="p-4 max-h-[60vh] overflow-y-auto">
            @if (items().length === 0) {
              <div
                class="flex flex-col items-center justify-center py-12 text-gray-500"
              >
                <mat-icon class="text-4xl mb-2">inbox</mat-icon>
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
                    cdkDrag
                  >
                    <mat-icon class="text-gray-400 cursor-grab" cdkDragHandle
                      >drag_indicator</mat-icon
                    >
                    <span class="font-medium text-gray-900 w-8 text-center">{{
                      i + 1
                    }}</span>
                    <span class="flex-1 min-w-0">{{ item.name }}</span>
                    @if (config().getItemSubtitle) {
                      <span
                        class="text-sm text-gray-500 min-w-[150px] truncate"
                        >{{ config().getItemSubtitle!(item) }}</span
                      >
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
              label="Cancelar"
              (clicked)="cancel()"
            >
            </app-button>
            <app-button
              variant="primary"
              [label]="config().confirmLabel"
              [loading]="confirmLoading()"
              [disabled]="items().length === 0 || confirmLoading()"
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

      .cdk-drag-preview {
        @apply shadow-lg-custom bg-white;
      }

      .cdk-drag-placeholder {
        @apply opacity-0;
      }

      .cdk-drag-animating {
        @apply transition-transform duration-200;
      }

      .cdk-drag-placeholder {
        @apply bg-gray-100 border-2 border-dashed border-gray-300;
      }
    `,
  ],
  animations: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReorderModalComponent {
  // State
  isOpen = input<boolean>(false);
  isOpenChange = output<boolean>();

  // Configuration
  config = input<ReorderModalConfig>({
    title: "Reordenar Itens",
    description: "Arraste e solte para definir a ordem",
    confirmLabel: "Salvar ordem",
    emptyMessage: "Nenhum item para reordenar",
  });

  // Items
  items = input<ReorderItem[]>([]);

  // State
  confirmLoading = input<boolean>(false);

  // Events
  confirmed = output<ReorderItem[]>();
  cancelled = output<void>();
  closed = output<void>();

  private _wasOpen = signal(false);
  private _items = signal<ReorderItem[]>([]);

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

    effect(() => {
      const items = this.items();
      if (items.length > 0) {
        this._items.set(
          [...items].sort((a, b) => a.displayOrder - b.displayOrder),
        );
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

  onDrop(event: CdkDragDrop<ReorderItem[]>): void {
    this._items.update((currentItems) => {
      const updated = [...currentItems];
      moveItemInArray(updated, event.previousIndex, event.currentIndex);
      return updated.map((item, index) => ({ ...item, displayOrder: index }));
    });
  }

  confirm(): void {
    if (this.confirmLoading()) return;
    this.confirmed.emit(this._items());
  }

  // Public method to get current items for parent component
  getCurrentItems(): ReorderItem[] {
    return this._items();
  }
}
