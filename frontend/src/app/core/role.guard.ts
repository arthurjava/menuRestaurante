import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as string[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (authService.isLoggedIn() && authService.hasAnyRole(allowedRoles)) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};