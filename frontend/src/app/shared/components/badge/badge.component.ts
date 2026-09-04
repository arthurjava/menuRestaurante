import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses()">
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  variant = input<BadgeVariant>('gray');
  dot = input(false);

  badgeClasses = computed(() => {
    const base = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    const variants: Record<BadgeVariant, string> = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800'
    };

    return `${base} ${variants[this.variant()]}`;
  });
}