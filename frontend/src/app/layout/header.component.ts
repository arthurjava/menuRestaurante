import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../shared/components/button/button.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonComponent],
  template: `
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-8">
            <button
              type="button"
              class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              (click)="sidebarToggle.emit()"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            
            <a routerLink="/dashboard" class="flex items-center gap-2" *ngIf="authService.isManager()">
              <svg class="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              <span class="text-xl font-bold text-gray-900">{{ appName() }}</span>
            </a>
            
            <a routerLink="/menu" class="flex items-center gap-2" *ngIf="!authService.isManager()">
              <svg class="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
              <span class="text-xl font-bold text-gray-900">{{ appName() }}</span>
            </a>
          </div>

          <div class="flex items-center gap-4">
            @if (authService.isAuthenticated()) {
              <div class="relative group">
                <button
                  type="button"
                  class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-primary-700 font-medium text-sm">
                      {{ authService.user()?.name?.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <span class="hidden sm:block text-sm font-medium text-gray-700">{{ authService.user()?.name }}</span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <div class="dropdown-menu">
                  <a routerLink="/profile" class="dropdown-item">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Perfil
                  </a>
                  <div class="dropdown-divider"></div>
                  <button type="button" class="dropdown-item text-red-600" (click)="logout()">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Sair
                  </button>
                </div>
              </div>
            } @else {
              <div class="flex items-center gap-2">
                <app-button variant="outline" routerLink="/login">Entrar</app-button>
                <app-button variant="primary" routerLink="/register">Cadastrar</app-button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  appName = input('Restaurante Cardápio');
  sidebarToggle = output<void>();
  logout = output<void>();

  constructor(public authService: AuthService) {}

  onLogout(): void {
    this.logout.emit();
  }
}