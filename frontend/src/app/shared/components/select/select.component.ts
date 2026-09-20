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
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";

export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}

@Component({
  selector: "app-select",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
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

      <mat-select
        [value]="value()"
        [disabled]="disabled()"
        [required]="required()"
        [multiple]="multiple()"
        [compareWith]="compareWith()"
        [placeholder]="placeholder()"
        [attr.aria-describedby]="error() ? 'error-' + id() : null"
        (selectionChange)="onSelectionChange($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        panelClass="custom-select-panel"
      >
        @if (!multiple() && placeholder()) {
          <mat-option
            value=""
            disabled
            [hidden]="value() !== null && value() !== ''"
            >{{ placeholder() }}</mat-option
          >
        }

        @if (groupedOptions().length > 0) {
          @for (group of groupedOptions(); track group.label) {
            <mat-optgroup [label]="group.label" [disabled]="group.disabled">
              @for (option of group.options; track option.value) {
                <mat-option [value]="option.value" [disabled]="option.disabled">
                  {{ option.label }}
                </mat-option>
              }
            </mat-optgroup>
          }
        } @else {
          @for (option of options(); track option.value) {
            <mat-option [value]="option.value" [disabled]="option.disabled">
              {{ option.label }}
            </mat-option>
          }
        }
      </mat-select>

      @if (prefixIcon()) {
        <mat-icon matPrefix class="text-gray-400">{{ prefixIcon() }}</mat-icon>
      }

      @if (error()) {
        <mat-error id="error-{{ id() }}">{{ error() }}</mat-error>
      } @else if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
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

      ::ng-deep .mat-mdc-select-panel {
        max-height: 300px;
      }

      ::ng-deep .custom-select-panel .mat-mdc-option {
        @apply px-3 py-2;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent<T = any> implements ControlValueAccessor {
  id = input<string>(Math.random().toString(36).substring(2, 9));
  label = input<string>("");
  placeholder = input<string>("");
  options = input<SelectOption<T>[]>([]);
  groupedOptions = input<
    { label: string; options: SelectOption<T>[]; disabled?: boolean }[]
  >([]);
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  error = input<string>("");
  hint = input<string>("");
  prefixIcon = input<string>("");
  multiple = input<boolean>(false);
  compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b);

  valueChange = output<T | T[]>();
  blurEvent = output<void>();
  focusEvent = output<void>();

  private onChange = (value: T | T[]) => {};
  private onTouched = () => {};

  value = signal<T | T[] | null>(null);

  computedClasses = computed(() => {
    return this.fullWidth() ? "full-width" : "";
  });

  fullWidth = computed(() => true);

  onSelectionChange(event: any): void {
    const newValue = event.value;
    this.value.set(newValue);
    this.onChange(newValue);
    this.valueChange.emit(newValue);
  }

  onFocus(): void {
    this.focusEvent.emit();
  }

  onBlur(): void {
    this.onTouched();
    this.blurEvent.emit();
  }

  writeValue(value: T | T[] | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled via input
  }
}
