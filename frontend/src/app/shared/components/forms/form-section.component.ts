import {
  Component,
  Input,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-form-section',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatExpansionModule],
  templateUrl: './form-section.component.html',
  styleUrl: './form-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormSectionComponent {
  @Input() label = '';
  @Input() hint = '';
  @Input() icon = '';
  @Input() collapsible = false;
  @Input() expanded = true;
  @Input() required = false;
  @Input() errorMessage = '';
  @Input() showErrorSummary = false;
  @Input() errorSummary: string[] = [];

  @ContentChild('sectionContent') contentTemplate!: TemplateRef<any>;

  readonly hasHint = computed(() => !!this.hint);
  readonly hasError = computed(() => !!this.errorMessage);
  readonly hasErrorSummary = computed(() => this.showErrorSummary && this.errorSummary.length > 0);

  onToggle(): void {
    // Expansion panel handles this
  }
}