import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy,
  computed,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-filter-bar",
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: "./filter-bar.component.html",
  styleUrl: "./filter-bar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBarComponent {
  @Input() expanded = false;
  @Input() showToggle = true;
  @Input() searchPlaceholder = "Buscar...";
  @Input() searchValue = "";
  @Output() searchValueChange = new EventEmitter<string>();
  @Output() toggle = new EventEmitter<boolean>();
  @Output() clearFilters = new EventEmitter<void>();

  @ContentChild("filterContent") filterContentTemplate!: TemplateRef<any>;
  @ContentChild("searchContent") searchContentTemplate!: TemplateRef<any>;

  readonly isExpanded = signal(this.expanded);

  readonly hasFilterContent = computed(() => !!this.filterContentTemplate);
  readonly hasSearchContent = computed(() => !!this.searchContentTemplate);

  onToggle(): void {
    const newValue = !this.isExpanded();
    this.isExpanded.set(newValue);
    this.toggle.emit(newValue);
  }

  onSearchChange(value: string): void {
    this.searchValueChange.emit(value);
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  hasActiveFilters(): boolean {
    return false; // TODO: Implement when filter content provides a way to check
  }
}
