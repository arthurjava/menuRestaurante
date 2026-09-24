import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
@Component({
  selector: "app-page-header",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./page-header.component.html",
  styleUrl: "./page-header.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  @Input() title = "";
  @Input() subtitle = "";
  @Input() icon = "";
  @Input() iconColor = "bg-primary-100 text-primary-600";
  @Input() showBreadcrumb = false;
  @Input() breadcrumbItems: Array<{ label: string; url?: string }> = [];

  @ContentChild("pageActions") pageActionsTemplate!: TemplateRef<any>;
  @ContentChild("breadcrumb") breadcrumbTemplate!: TemplateRef<any>;

  readonly hasActions = computed(() => !!this.pageActionsTemplate);
  readonly hasSubtitle = computed(() => !!this.subtitle);
  readonly hasBreadcrumb = computed(
    () => this.showBreadcrumb && this.breadcrumbItems.length > 0,
  );
  readonly hasCustomBreadcrumb = computed(() => !!this.breadcrumbTemplate);
}
