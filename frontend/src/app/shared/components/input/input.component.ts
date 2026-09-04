import { Component, input, output, forwardRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

type InputVariant = 'default' | 'decimal' | 'integer';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
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
      <input
        [id]="id()"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabledState() || appNumberOnly() ? 'readonly' : ''"
        [required]="required()"
        [readonly]="readonly() || appNumberOnly()"
        [value]="value()"
        [class]="inputClasses()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      />
      @if (error() && (touched() || submitted())) {
        <p class="form-error">{{ error() }}</p>
      }
      @if (hint() && !error()) {
        <p class="form-hint">{{ hint() }}</p>
      }
    </div>
  `
})
export class InputComponent implements ControlValueAccessor {
  id = input.required<string>();
  label = input<string>('');
  type = input<InputType>('text');
  placeholder = input<string>('');
  disabled = input(false);
  required = input(false);
  readonly = input(false);
  error = input<string>('');
  hint = input<string>('');
  submitted = input(false);
  allowDecimal = input(false);
  appNumberOnly = input(false);

  disabledState = signal(false);

  value = signal('');
  touched = signal(false);
  focused = signal(false);

  private onChange = (value: string) => {};
  private onTouched = () => {};

  inputClasses = computed(() => {
    const base = 'form-input';
    const errorClass = this.error() && (this.touched() || this.submitted()) ? 'form-input-error' : '';
    const focusClass = this.focused() ? 'ring-2 ring-primary-500 border-transparent' : '';
    return `${base} ${errorClass} ${focusClass}`;
  });

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  onBlur(): void {
    this.touched.set(true);
    this.focused.set(false);
    this.onTouched();
  }

  onFocus(): void {
    this.focused.set(true);
  }

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }
}