import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  HostBinding,
  HostListener,
  inject,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  BaseModalConfig,
  DEFAULT_MODAL_CONFIG,
  MODAL_SIZE_CLASSES,
  ModalSize,
} from './base-modal.types';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './base-modal.component.html',
  styleUrl: './base-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseModalComponent {
  @Input({ required: true }) isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  @Input() config: BaseModalConfig = {};
  @Output() headerActions = new EventEmitter<void>();
  @Output() footerActions = new EventEmitter<void>();

  private readonly mergedConfig = computed(() => ({
    ...DEFAULT_MODAL_CONFIG,
    ...this.config,
  }));

  readonly modalSizeClass = computed(() => {
    const size = this.mergedConfig().size;
    return MODAL_SIZE_CLASSES[size];
  });
  readonly showHeader = computed(() => this.mergedConfig().showHeader);
  readonly showFooter = computed(() => this.mergedConfig().showFooter);
  readonly isAnimating = signal(false);

  @HostBinding('class') get hostClasses(): string {
    return `base-modal ${this.modalSizeClass()} ${this.isOpen ? 'open' : ''} ${this.isAnimating() ? 'animating' : ''}`;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (this.isOpen && this.mergedConfig().closeOnEscape && this.mergedConfig().closable) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (
      event.target === event.currentTarget &&
      this.mergedConfig().closeOnBackdrop &&
      this.mergedConfig().closable
    ) {
      this.close();
    }
  }

  onContainerClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  close(): void {
    this.isOpenChange.emit(false);
  }

  protected readonly configSignal = this.mergedConfig;
}