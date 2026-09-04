import { Component, input, output, forwardRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-group">
      @if (label()) {
        <label [for]="id()" class="form-label">
          {{ label() }}
          @if (required()) {
            <span class="text-red-500 ml-1">*</span>
          }
        </label>
      }
      <select
        [id]="id()"
        [disabled]="disabledState()"
        [required]="required()"
        [value]="value()"
        [class]="selectClasses()"
        (change)="onChange($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      >
        @if (placeholder()) {
          <option [value]="''" disabled>{{ placeholder() }}</option>
        }
        @for (option of options(); track option.value) {
          <option [value]="option.value" [disabled]="option.disabled">
            {{ option.label }}
          </option>
        }
      </select>
      @if (error() && (touched() || submitted())) {
        <p class="form-error">{{ error() }}</p>
      }
      @if (hint() && !error()) {
        <p class="form-hint">{{ hint() }}</p>
      }
    </div>
  `
})
export class SelectComponent<T = any> implements ControlValueAccessor {
  id = input.required<string>();
  label = input<string>('');
  placeholder = input<string>('');
  options = input<SelectOption<T>[]>([]);
  disabled = input(false);
  required = input(false);
  error = input<string>('');
  hint = input<string>('');
  submitted = input(false);

  disabledState = signal(false);

  value = signal<T | ''>('');
  touched = signal(false);
  focused = signal(false);

  private onChangeFn = (value: T) => {};
  private onTouchedFn = () => {};

  selectClasses = computed(() => {
    const base = 'form-input appearance-none bg-white';
    const errorClass = this.error() && (this.touched() || this.submitted()) ? 'form-input-error' : '';
    const focusClass = this.focused() ? 'ring-2 ring-primary-500 border-transparent' : '';
    return `${base} ${errorClass} ${focusClass}`;
  });

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value as T;
    this.value.set(value);
    this.onChangeFn(value);
  }

  onBlur(): void {
    this.touched.set(true);
    this.focused.set(false);
    this.onTouchedFn();
  }

  onFocus(): void {
    this.focused.set(true);
  }

  writeValue(value: T): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }
}