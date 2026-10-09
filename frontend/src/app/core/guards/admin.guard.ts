import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional Route Guard:
 * Restricts access to Admin-only routes (like /admin).
 * If the user is logged in but not an Admin, redirects to /dashboard.
 */
export const adminGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // If not an admin, send back to dashboard
  router.navigate(['/dashboard']);
  return false;
};
