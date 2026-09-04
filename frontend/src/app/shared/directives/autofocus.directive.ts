import { Directive, ElementRef, AfterViewInit, input } from '@angular/core';

@Directive({ selector: '[appAutofocus]', standalone: true })
export class AutofocusDirective implements AfterViewInit {
  delay = input(0);

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, this.delay());
  }
}