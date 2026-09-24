import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
} from "@angular/core";
import {
  ConfirmModalComponent,
  type ConfirmModalConfig,
  type ConfirmVariant,
} from "../modal";

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [ConfirmModalComponent],
  templateUrl: "./confirm-dialog.component.html",
  styleUrl: "./confirm-dialog.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();

  @Input() title = "Confirmar";
  @Input() message = "Tem certeza que deseja realizar esta ação?";
  @Input() confirmLabel = "Confirmar";
  @Input() cancelLabel = "Cancelar";
  @Input() variant: ConfirmVariant = "danger";
  @Input() loading = false;
  @Input() size: "sm" | "md" = "sm";

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  protected readonly config = computed<ConfirmModalConfig>(() => ({
    title: this.title,
    message: this.message,
    confirmLabel: this.confirmLabel,
    cancelLabel: this.cancelLabel,
    variant: this.variant,
    loading: this.loading,
    baseConfig: {
      size: this.size,
      showHeader: true,
      showFooter: true,
      closable: true,
      closeOnBackdrop: !this.loading,
      closeOnEscape: !this.loading,
    },
  }));

  onConfirmed(): void {
    this.confirmed.emit();
  }

  onCancelled(): void {
    this.isOpenChange.emit(false);
    this.cancelled.emit();
  }
}
