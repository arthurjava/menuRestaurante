import {
  Component,
  HostBinding,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AdminSidebarComponent } from './sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from './header/admin-header.component';
import { AdminFooterComponent } from './footer/admin-footer.component';

type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: UserRole[];
  badge?: string;
  children?: NavItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
    AdminSidebarComponent,
    AdminHeaderComponent,
    AdminFooterComponent,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  readonly sidebarOpened = signal(true);
  readonly sidebarCollapsed = signal(false);
  readonly mobileDrawerOpened = signal(false);
  readonly currentUrl = signal('');

  readonly user = this.authService.user;
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly notifications = this.notificationService.notifications;

  readonly navSections = computed<NavSection[]>(() => [
    {
      label: 'Principal',
      items: [
        { label: 'Painel', route: '/admin/dashboard', icon: 'dashboard', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
      ],
    },
    {
      label: 'Cardápio',
      items: [
        { label: 'Categorias', route: '/admin/categories', icon: 'category', roles: ['ADMIN'] },
        { label: 'Pratos', route: '/admin/dishes', icon: 'restaurant', roles: ['ADMIN'] },
      ],
    },
    {
      label: 'Administração',
      items: [
        { label: 'Usuários', route: '/admin/users', icon: 'people', roles: ['ADMIN'] },
        { label: 'Configurações', route: '/admin/settings', icon: 'settings', roles: ['ADMIN'] },
      ],
    },
  ]);

  readonly filteredNavSections = computed(() => {
    const userRole = this.user()?.role;
    const userRoles: UserRole[] = userRole ? [userRole] : [];
    return this.navSections().map(section => ({
      ...section,
      items: section.items.filter(item =>
        !item.roles || item.roles.some(role => userRoles.includes(role))
      ),
    })).filter(section => section.items.length > 0);
  });

  @HostBinding('class')
  get hostClasses(): string {
    return `admin-layout ${this.sidebarCollapsed() ? 'sidebar-collapsed' : ''} ${this.mobileDrawerOpened() ? 'drawer-open' : ''}`;
  }

  ngOnInit(): void {
    this.currentUrl.set(this.router.url);

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.urlAfterRedirects);
        this.mobileDrawerOpened.set(false);
      });

    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.checkScreenSize.bind(this));
  }

  private checkScreenSize(): void {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    if (isMobile) {
      this.sidebarOpened.set(false);
      this.sidebarCollapsed.set(false);
    } else if (isTablet) {
      this.sidebarOpened.set(true);
      this.sidebarCollapsed.set(true);
    } else {
      this.sidebarOpened.set(true);
      this.sidebarCollapsed.set(false);
    }
  }

  toggleSidebar(): void {
    if (window.innerWidth < 768) {
      this.mobileDrawerOpened.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }

  closeMobileDrawer(): void {
    this.mobileDrawerOpened.set(false);
  }

  onSidebarNavigation(route: string): void {
    this.router.navigate([route]);
    this.closeMobileDrawer();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}