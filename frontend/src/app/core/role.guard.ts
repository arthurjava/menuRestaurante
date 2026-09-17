import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(role: string): boolean {
    if (this.authService.isLoggedIn() && this.authService.getRole() === role) {
      return true;
    }
    this.router.navigate(['/auth/login']);
    return false;
  }
}