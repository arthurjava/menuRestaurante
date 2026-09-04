import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="onOverlayClick($event)">
        <div class="modal-content" [class.max-w-lg]="!large()" [class.max-w-2xl]="large()" [class.max-w-4xl]="xlarge()" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="modal-header">
            <h2 id="modal-title" class="modal-title">{{ title() }}</h2>
            <button type="button" class="text-gray-400 hover:text-gray-600" (click)="close.emit()">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          @if (showFooter()) {
            <div class="modal-footer">
              <ng-content select="[slot=footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  isOpen = input(false);
  title = input('');
  large = input(false);
  xlarge = input(false);
  showFooter = input(true);
  closeOnOverlayClick = input(true);
  close = output<void>();

  onOverlayClick(event: MouseEvent): void {
    if (this.closeOnOverlayClick() && event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}