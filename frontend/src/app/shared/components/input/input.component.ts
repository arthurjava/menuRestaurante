import {
  Component,
  input,
  output,
  forwardRef,
  computed,
  signal,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export type InputType =
  'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <mat-form-field
      appearance="outline"
      subscriptSizing="dynamic"
      [class]="'w-full ' + computedClasses()"
    >
      @if (label()) {
        <mat-label>{{ label() }}</mat-label>
      }

      <input
        matInput
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [readonly]="readonly()"
        [required]="required()"
        [value]="value()"
        [attr.aria-describedby]="(error() || hint()) ? describedById : null"
        [attr.aria-invalid]="!!error()"
        [attr.aria-required]="required()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
        (keydown)="onKeydown($event)"
        [attr.autocomplete]="autocomplete()"
        [attr.min]="min() || null"
        [attr.max]="max() || null"
        [attr.step]="step() || null"
        [attr.pattern]="pattern() || null"
      />

      @if (prefixIcon()) {
        <mat-icon matPrefix class="text-text-tertiary" aria-hidden="true">{{ prefixIcon() }}</mat-icon>
      }

      @if (suffixIcon()) {
        <mat-icon
          matSuffix
          class="text-text-tertiary cursor-pointer"
          (click)="onSuffixClick()"
          aria-hidden="true"
        >{{ suffixIcon() }}</mat-icon>
      }

      @if (error()) {
        <mat-error #errorEl id="error-{{ id() }}">{{ error() }}</mat-error>
      } @else if (hint()) {
        <mat-hint #hintEl id="hint-{{ id() }}">{{ hint() }}</mat-hint>
      }

      @if (showCounter() && maxLength()) {
        <mat-hint align="end" id="counter-{{ id() }}">
          {{ value()?.length ?? 0 }} / {{ maxLength() }}
        </mat-hint>
      }
    </mat-form-field>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    :host-context(.input-error) ::ng-deep .mat-mdc-form-field .mdc-notched-outline__leading,
    :host-context(.input-error) ::ng-deep .mat-mdc-form-field .mdc-notched-outline__trailing,
    :host-context(.input-error) ::ng-deep .mat-mdc-form-field .mdc-notched-outline__notch {
      border-color: var(--color-border-error, #ef4444) !important;
    }

    :host-context(.input-success) ::ng-deep .mat-mdc-form-field .mdc-notched-outline__leading,
    :host-context(.input-success) ::ng-deep .mat-mdc-form-field .mdc-notched-outline__trailing,
    :host-context(.input-success) ::ng-deep .mat-mdc-form-field .mdc-notched-outline__notch {
      border-color: var(--color-border-success, #22c55e) !important;
    }

    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: var(--color-surface-primary, #ffffff);
    }

    ::ng-deep .mat-mdc-form-field-error .mat-mdc-form-field-error-wrapper {
      color: var(--color-state-danger, #dc2626);
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-focus-overlay {
      background-color: color-mix(in srgb, var(--color-brand-primary, #4f46e5) 10%, transparent);
    }

    ::ng-deep .mat-mdc-form-field .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field .mdc-notched-outline__trailing,
    ::ng-deep .mat-mdc-form-field .mdc-notched-outline__notch {
      border-color: var(--color-border-default, #e5e7eb);
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch {
      border-color: var(--color-brand-primary, #4f46e5);
      border-width: 2px;
    }

    ::ng-deep .mat-mdc-form-field-error .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field-error .mdc-notched-outline__trailing,
    ::ng-deep .mat-mdc-form-field-error .mdc-notched-outline__notch {
      border-color: var(--color-state-danger, #dc2626);
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-label {
      color: var(--color-text-secondary, #4b5563);
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-label {
      color: var(--color-brand-primary, #4f46e5);
    }

    ::ng-deep .mat-mdc-form-field-error .mat-mdc-form-field-label {
      color: var(--color-state-danger, #dc2626);
    }

    ::ng-deep .mat-mdc-form-field-hint {
      color: var(--color-text-tertiary, #9ca3af);
    }

    ::ng-deep .mat-mdc-form-field.mat-form-field-disabled .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field.mat-form-field-disabled .mdc-notched-outline__trailing,
    ::ng-deep .mat-mdc-form-field.mat-form-field-disabled .mdc-notched-outline__notch {
      border-color: var(--color-border-subtle, #f3f4f6);
    }

    ::ng-deep .mat-mdc-form-field.mat-form-field-disabled .mat-mdc-form-field-label {
      color: var(--color-text-disabled, #9ca3af);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor {
  id = input<string>(`input-${Math.random().toString(36).substring(2, 9)}`);
  label = input<string>('');
  placeholder = input<string>('');
  type = input<InputType>('text');
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  required = input<boolean>(false);
  error = input<string>('');
  hint = input<string>('');
  prefixIcon = input<string>('');
  suffixIcon = input<string>('');
  maxLength = input<number>(0);
  showCounter = input<boolean>(false);
  autocomplete = input<string>('off');
  min = input<number | string>('');
  max = input<number | string>('');
  step = input<number | string>('');
  pattern = input<string>('');
  fullWidth = input<boolean>(true);

  valueChange = output<string>();
  blurEvent = output<void>();
  focusEvent = output<void>();
  suffixClick = output<void>();
  keydownEnter = output<void>();

  private onChange = (value: string) => {};
  private onTouched = () => {};

  value = signal<string>('');
  focused = signal(false);

  @HostBinding('class.input-error')
  get hasError(): boolean {
    return !!this.error();
  }

  @HostBinding('class.input-success')
  get hasSuccess(): boolean {
    return !this.error() && this.value().length > 0 && !this.focused();
  }

  get describedById(): string {
    if (this.error()) return `error-${this.id()}`;
    if (this.hint()) return `hint-${this.id()}`;
    if (this.showCounter() && this.maxLength()) return `counter-${this.id()}`;
    return '';
  }

  computedClasses = computed(() => {
    return this.fullWidth() ? 'w-full' : '';
  });

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
    this.onChange(input.value);
    this.valueChange.emit(input.value);
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouched();
    this.blurEvent.emit();
  }

  onFocus(): void {
    this.focused.set(true);
    this.focusEvent.emit();
  }

  onSuffixClick(): void {
    this.suffixClick.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.keydownEnter.emit();
    }
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Disabled state is handled via input
  }
}