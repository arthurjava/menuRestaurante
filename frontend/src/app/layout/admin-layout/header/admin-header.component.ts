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
      case 'success': return 'bg-success-100 text-success-600';
      case 'error': return 'bg-danger-100 text-danger-600';
      case 'warning': return 'bg-warning-100 text-warning-600';
      case 'info': return 'bg-info-100 text-info-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}