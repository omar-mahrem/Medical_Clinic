import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login']);
      return false;
    }

    const userRoles = authService.currentUser()?.roles || [];
    const hasRole = allowedRoles.some(r => userRoles.includes(r));

    if (hasRole) {
      return true;
    }

    router.navigate(['/']);
    return false;
  };
};
