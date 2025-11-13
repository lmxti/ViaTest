import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Revisa si hay un token guardado (método síncrono)
  if (authService.getToken()) {
    return true; // Tiene token, puede pasar
  }

  // No tiene token, redirige a login
  router.navigate(['/login']);
  return false;
};