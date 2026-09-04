import { Directive, ElementRef, HostListener, Output, EventEmitter, inject } from '@angular/core';

@Directive({ selector: '[appClickOutside]', standalone: true })
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<MouseEvent>();

  private elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.clickOutside.emit(event);
    }
  }
}