import { Component, input, output, computed, effect, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../button/button.component';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, ButtonComponent],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-black/50 transition-opacity"
            (click)="onBackdropClick()"
            [@fadeIn]>
          </div>

          <!-- Modal Container -->
          <div
            class="relative w-full bg-white rounded-xl shadow-xl transform transition-all"
            [class]="modalSizeClass()"
            [@slideUp]
            (@slideUp.done)="onAnimationDone($event)">
            
            @if (showHeader()) {
              <div class="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                  @if (icon()) {
                    <div class="flex items-center gap-2">
                      <mat-icon [class]="iconColor()">{{ icon() }}</mat-icon>
                      <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
                    </div>
                  } @else {
                    <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
                  }
                  @if (description()) {
                    <p class="text-sm text-gray-500 mt-0.5">{{ description() }}</p>
                  }
                </div>
                @if (closable()) {
                  <button
                    type="button"
                    class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    (click)="close()"
                    aria-label="Fechar modal">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </div>
            }

            <div class="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <ng-content></ng-content>
            </div>

            @if (showFooter()) {
              <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                @if (cancelLabel()) {
                  <app-button
                    variant="secondary"
                    [label]="cancelLabel()"
                    (clicked)="cancel()">
                  </app-button>
                }
                <app-button
                  [variant]="confirmVariant()"
                  [label]="confirmLabel()"
                  [loading]="confirmLoading()"
                  [disabled]="confirmDisabled()"
                  (clicked)="confirm()">
                </app-button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }

    .modal-sm { @apply max-w-sm; }
    .modal-md { @apply max-w-md; }
    .modal-lg { @apply max-w-lg; }
    .modal-xl { @apply max-w-xl; }
    .modal-full { @apply max-w-4xl; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .fade-in { animation: fadeIn 0.2s ease-out; }
    .slide-up { animation: slideUp 0.2s ease-out; }
  `],
  animations: [
    // Using simple CSS animations instead of Angular animations for simplicity
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  // State
  isOpen = input<boolean>(false);
  isOpenChange = output<boolean>();

  // Content
  title = input<string>('');
  description = input<string>('');
  icon = input<string>('');
  iconColor = input<string>('text-indigo-600');

  // Header/Footer
  showHeader = input<boolean>(true);
  showFooter = input<boolean>(true);
  closable = input<boolean>(true);

  // Footer actions
  cancelLabel = input<string>('Cancelar');
  confirmLabel = input<string>('Confirmar');
  confirmVariant = input<'primary' | 'danger' | 'secondary'>('primary');
  confirmLoading = input<boolean>(false);
  confirmDisabled = input<boolean>(false);

  // Size
  size = input<ModalSize>('md');

  // Events
  confirmed = output<void>();
  cancelled = output<void>();
  closed = output<void>();

  private _wasOpen = signal(false);

  modalSizeClass = computed(() => {
    const sizes = {
      sm: 'modal-sm',
      md: 'modal-md',
      lg: 'modal-lg',
      xl: 'modal-xl',
      full: 'modal-full'
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
      this.close();
    }
  }

  close(): void {
    this.isOpenChange.emit(false);
    this.closed.emit();
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