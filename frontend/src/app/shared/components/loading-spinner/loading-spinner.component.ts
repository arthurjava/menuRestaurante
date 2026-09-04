import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses()" role="status" aria-label="Carregando">
      <svg [class]="spinnerClasses()" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-dasharray="90 150"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      @if (label()) {
        <span class="sr-only">{{ label() }}</span>
      }
    </div>
  `
})
export class LoadingSpinnerComponent {
  size = input<SpinnerSize>('md');
  label = input('Carregando...');
  inline = input(false);
  overlay = input(false);

  spinnerClasses = computed(() => {
    const sizes: Record<SpinnerSize, string> = {
      sm: 'w-5 h-5',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };
    return `${sizes[this.size()]} animate-spin text-primary-600`;
  });

  containerClasses = computed(() => {
    const base = 'flex items-center justify-center';
    const inlineClass = this.inline() ? 'inline-flex' : 'flex';
    const overlayClass = this.overlay() ? 'fixed inset-0 bg-white/80 z-50' : '';
    return `${inlineClass} ${base} ${overlayClass}`;
  });
}