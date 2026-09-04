import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="empty-state">
      @if (icon()) {
        <div class="empty-state-icon">
          <svg [class]="iconSize()" [innerHTML]="icon()"></svg>
        </div>
      }
      <h3 class="empty-state-title">{{ title() }}</h3>
      @if (description()) {
        <p class="empty-state-description">{{ description() }}</p>
      }
      @if (actionLabel()) {
        <app-button variant="primary" (click)="action.emit()">
          {{ actionLabel() }}
        </app-button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  title = input('Nenhum registro encontrado');
  description = input('');
  icon = input('');
  iconSize = input('w-12 h-12');
  actionLabel = input('');
  action = output<void>();
}