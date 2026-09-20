import {
  Component,
  input,
  output,
  forwardRef,
  computed,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";

export type InputType =
  "text" | "email" | "password" | "number" | "tel" | "url" | "search";

@Component({
  selector: "app-input",
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
      [class]="computedClasses()"
      appearance="outline"
      subscriptSizing="dynamic"
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
        [attr.aria-describedby]="error() ? 'error-' + id() : null"
        [attr.aria-invalid]="!!error()"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
        (keydown)="onKeydown($event)"
      />

      @if (prefixIcon()) {
        <mat-icon matPrefix class="text-gray-400">{{ prefixIcon() }}</mat-icon>
      }

      @if (suffixIcon()) {
        <mat-icon
          matSuffix
          class="text-gray-400 cursor-pointer"
          (click)="onSuffixClick()"
          >{{ suffixIcon() }}</mat-icon
        >
      }

      @if (error()) {
        <mat-error id="error-{{ id() }}">{{ error() }}</mat-error>
      } @else if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }

      @if (showCounter() && maxLength()) {
        <mat-hint align="end"
          >{{ value()?.length ?? 0 }} / {{ maxLength() }}</mat-hint
        >
      }
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .full-width {
        width: 100%;
      }

      ::ng-deep .mat-mdc-form-field {
        width: 100%;
      }

      ::ng-deep .mat-mdc-text-field-wrapper {
        background-color: white;
      }

      ::ng-deep .mat-mdc-form-field-error .mat-mdc-form-field-error-wrapper {
        color: #dc2626;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor {
  id = input<string>(Math.random().toString(36).substring(2, 9));
  label = input<string>("");
  placeholder = input<string>("");
  type = input<InputType>("text");
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  required = input<boolean>(false);
  error = input<string>("");
  hint = input<string>("");
  prefixIcon = input<string>("");
  suffixIcon = input<string>("");
  maxLength = input<number>(0);
  showCounter = input<boolean>(false);
  autocomplete = input<string>("off");
  min = input<number | string>("");
  max = input<number | string>("");
  step = input<number | string>("");
  pattern = input<string>("");
  fullWidth = input<boolean>(true);

  valueChange = output<string>();
  blurEvent = output<void>();
  focusEvent = output<void>();
  suffixClick = output<void>();
  keydownEnter = output<void>();

  private onChange = (value: string) => {};
  private onTouched = () => {};

  value = signal<string>("");

  computedClasses = computed(() => {
    return this.fullWidth() ? "full-width" : "";
  });

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value.set(input.value);
    this.onChange(input.value);
    this.valueChange.emit(input.value);
  }

  onBlur(): void {
    this.onTouched();
    this.blurEvent.emit();
  }

  onFocus(): void {
    this.focusEvent.emit();
  }

  onSuffixClick(): void {
    this.suffixClick.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      this.keydownEnter.emit();
    }
  }

  writeValue(value: string): void {
    this.value.set(value ?? "");
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
