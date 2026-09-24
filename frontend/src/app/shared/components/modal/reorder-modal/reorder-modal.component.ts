import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { BaseModalComponent } from "../base-modal";
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from "@angular/cdk/drag-drop";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatBadgeModule } from "@angular/material/badge";

export interface ReorderItem {
  id: string | number;
  name: string;
  description?: string;
  status?: "active" | "inactive" | "pending";
  displayOrder: number;
  imageUrl?: string;
}

export interface ReorderModalConfig {
  items: ReorderItem[];
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  baseConfig?: Partial<{
    size: "sm" | "md" | "lg" | "xl" | "full";
    showHeader: boolean;
    showFooter: boolean;
    closable: boolean;
    closeOnBackdrop: boolean;
    closeOnEscape: boolean;
  }>;
}

const STATUS_CONFIG = {
  active: { label: "Ativo", class: "badge-success" },
  inactive: { label: "Inativo", class: "badge-gray" },
  pending: { label: "Pendente", class: "badge-warning" },
};

@Component({
  selector: "app-reorder-modal",
  standalone: true,
  imports: [
    CommonModule,
    BaseModalComponent,
    DragDropModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
  ],
  templateUrl: "./reorder-modal.component.html",
  styleUrl: "./reorder-modal.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReorderModalComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  @Input() config: ReorderModalConfig = {
    items: [],
    title: "Reordenar",
    confirmLabel: "Salvar ordem",
  };

  @Output() reordered = new EventEmitter<ReorderItem[]>();
  @Output() cancelled = new EventEmitter<void>();

  readonly items = signal<ReorderItem[]>([]);
  readonly isDirty = signal(false);

  ngOnChanges(): void {
    if (this.config.items) {
      this.items.set(
        [...this.config.items].sort((a, b) => a.displayOrder - b.displayOrder),
      );
      this.isDirty.set(false);
    }
  }

  onDrop(event: CdkDragDrop<ReorderItem[]>): void {
    const currentItems = [...this.items()];
    moveItemInArray(currentItems, event.previousIndex, event.currentIndex);
    currentItems.forEach((item, index) => {
      item.displayOrder = index + 1;
    });
    this.items.set(currentItems);
    this.isDirty.set(true);
  }

  onSave(): void {
    this.reordered.emit(this.items());
    this.isDirty.set(false);
  }

  onCancel(): void {
    this.isOpenChange.emit(false);
    this.cancelled.emit();
  }

  protected readonly configSignal = computed(() => ({
    size: this.config.baseConfig?.size ?? "lg",
    title: this.config.title ?? "Reordenar",
    description: this.config.description ?? "Arraste os itens para reordenar",
    icon: "drag_indicator",
    iconColor: "bg-primary-100 text-primary-600",
    showHeader: this.config.baseConfig?.showHeader ?? true,
    showFooter: this.config.baseConfig?.showFooter ?? true,
    closable: this.config.baseConfig?.closable ?? true,
    closeOnBackdrop: this.config.baseConfig?.closeOnBackdrop ?? !this.isDirty(),
    closeOnEscape: this.config.baseConfig?.closeOnEscape ?? !this.isDirty(),
  }));

  getStatusClass(status?: string): string {
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.class ?? "badge-gray"
    );
  }

  getStatusLabel(status?: string): string {
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label ?? status ?? ""
    );
  }
}
