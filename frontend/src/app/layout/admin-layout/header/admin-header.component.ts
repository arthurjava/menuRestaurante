import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService, Notification, NotificationType } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHeaderComponent {
  @Input() sidebarCollapsed = false;
  @Input() mobileDrawerOpened = false;

  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly notifications = this.notificationService.notifications;

  readonly userMenuOpen = signal(false);
  readonly notificationsOpen = signal(false);

  protected readonly userInitials = computed(() => {
    const name = this.user()?.name || 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  });

  protected readonly userRoleLabel = computed(() => {
    const role = this.user()?.role;
    if (role === 'ADMIN') return 'Administrador';
    if (role === 'MANAGER') return 'Gerente';
    if (role === 'STAFF') return 'Funcionário';
    return 'Usuário';
  });

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }

  clearAllNotifications(): void {
    this.notificationService.clear();
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'notifications';
    }
  }

  getNotificationIconClass(type: NotificationType): string {
    switch (type) {
      case 'success': return 'bg-state-success-subtle text-state-success-hover';
      case 'error': return 'bg-state-danger-subtle text-state-danger-hover';
      case 'warning': return 'bg-state-warning-subtle text-state-warning-hover';
      case 'info': return 'bg-state-info-subtle text-state-info-hover';
      default: return 'bg-surface-tertiary text-text-tertiary';
    }
  }
}