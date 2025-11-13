import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken(); // Obtiene el token del servicio

  // Verifica si es una petición a tu API y si tienes token
  if (token && req.url.startsWith('http://localhost:3000/api')) {
    // Clona la petición y añade el encabezado de Autorización
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq); // Envía la petición clonada
  }

  // Si no hay token o no es a tu API, deja pasar la petición original
  return next(req);
};