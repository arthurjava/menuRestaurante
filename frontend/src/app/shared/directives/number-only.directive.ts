import { Directive, HostListener, input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  selector: 'input[appNumberOnly]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: NumberOnlyDirective,
    multi: true
  }]
})
export class NumberOnlyDirective implements ControlValueAccessor {
  allowDecimal = input(true);
  decimalSeparator = input('.');

  private onChange = (value: string) => {};
  private onTouched = () => {};

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    if (this.allowDecimal()) {
      const separator = this.decimalSeparator();
      const regex = new RegExp(`[^0-9${separator}]`, 'g');
      value = value.replace(regex, '');
      
      const parts = value.split(separator);
      if (parts.length > 2) {
        value = parts[0] + separator + parts.slice(1).join('');
      }
    } else {
      value = value.replace(/[^0-9]/g, '');
    }
    
    input.value = value;
    this.onChange(value);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string): void {
    // No-op for native input
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}