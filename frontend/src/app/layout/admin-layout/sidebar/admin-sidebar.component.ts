import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatListModule } from "@angular/material/list";
import { MatRippleModule } from "@angular/material/core";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatBadgeModule } from "@angular/material/badge";
import { MatExpansionModule } from "@angular/material/expansion";

export interface NavSection {
  label: string;
  items: NavItem[];
}

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
  badge?: string;
  children?: NavItem[];
  expanded?: boolean;
}

@Component({
  selector: "app-admin-sidebar",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatRippleModule,
    MatTooltipModule,
    MatBadgeModule,
    MatExpansionModule,
  ],
  templateUrl: "./admin-sidebar.component.html",
  styleUrl: "./admin-sidebar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebarComponent {
  @Input() collapsed = false;
  @Input() sections: NavSection[] = [];
  @Input() currentUrl = "";

  @Output() navigate = new EventEmitter<string>();

  readonly isCollapsed = computed(() => this.collapsed);
  readonly hasSections = computed(() => this.sections.length > 0);

  onNavClick(item: NavItem): void {
    if (item.children && item.children.length > 0) {
      return; // Expansion panel handles this
    }
    this.navigate.emit(item.route);
  }

  isActive(item: NavItem): boolean {
    return (
      this.currentUrl === item.route ||
      this.currentUrl.startsWith(item.route + "/")
    );
  }

  isSectionActive(section: NavSection): boolean {
    return section.items.some((item) => this.isActive(item));
  }

  trackByRoute(index: number, item: NavItem): string {
    return item.route;
  }
}
