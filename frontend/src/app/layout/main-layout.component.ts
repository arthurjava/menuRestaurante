import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header 
        [appName]="appName"
        (sidebarToggle)="toggleSidebar()"
        (logout)="onLogout()"
      ></app-header>
      
      <app-sidebar 
        [isOpen]="sidebarOpen()"
        [appName]="appName"
        (close)="closeSidebar()"
        (logout)="onLogout()"
      ></app-sidebar>

      <div 
        class="lg:pl-64 transition-all duration-300"
        [class.pl-64]="sidebarOpen() || isDesktop()"
      >
        <main class="content-wrapper">
          <router-outlet></router-outlet>
        </main>
      </div>

      @if (sidebarOpen() && !isDesktop()) {
        <div 
          class="fixed inset-0 bg-black/50 z-40 lg:hidden"
          (click)="closeSidebar()"
          aria-hidden="true"
        ></div>
      }
    </div>
  `
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  
  appName = 'Restaurante Cardápio';
  sidebarOpen = signal(false);
  isDesktop = signal(false);

  constructor() {
    effect(() => {
      if (typeof window !== 'undefined') {
        this.isDesktop.set(window.innerWidth >= 1024);
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  onLogout(): void {
    this.authService.logout();
  }
}