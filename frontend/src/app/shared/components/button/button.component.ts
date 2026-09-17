import { Component, input, output, computed, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <button
      matButton
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="computedClasses()"
      (click)="onClick($event)">
      @if (loading()) {
        <mat-spinner diameter="20" class="mr-2"></mat-spinner>
      } @else if (icon() && !loading()) {
        <mat-icon class="mr-2">{{ icon() }}</mat-icon>
      }
      <span>{{ label() }}</span>
    </button>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }

    button {
      @apply inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
    }

    .btn-sm { @apply px-3 py-1.5 text-sm gap-1.5; }
    .btn-md { @apply px-4 py-2 text-sm gap-2; }
    .btn-lg { @apply px-6 py-3 text-base gap-2; }
    .btn-icon { @apply p-2; }

    .variant-primary { @apply bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500; }
    .variant-secondary { @apply bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500; }
    .variant-danger { @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500; }
    .variant-outline { @apply border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500; }
    .variant-ghost { @apply bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500; }

    .full-width { @apply w-full; }

    mat-spinner {
      @apply h-5 w-5;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  label = input<string>('');
  icon = input<string>('');
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);

  clicked = output<MouseEvent>();

  @HostBinding('class')
  get hostClasses(): string {
    return this.fullWidth() ? 'w-full' : '';
  }

  computedClasses = computed(() => {
    const classes = ['btn'];
    classes.push(`btn-${this.size()}`);
    classes.push(`variant-${this.variant()}`);
    if (this.fullWidth()) classes.push('full-width');
    return classes.join(' ');
  });

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}