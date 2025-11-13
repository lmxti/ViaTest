import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

export const licenseClassGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  
  // 1. Define las clases que son válidas en tu aplicación
  const validClasses = ['B', 'C']; // <-- ¡Añade 'A', 'D', etc. aquí en el futuro!

  // 2. Obtiene el parámetro 'classType' de la ruta que se intenta activar
  //    (Usamos toUpperCase() para ser flexibles con /clase/b o /clase/B)
  const requestedClass = route.paramMap.get('classType')?.toUpperCase();

  // 3. Inyecta el Router para poder redirigir
  const router = inject(Router);

  // 4. Comprueba si la clase solicitada está en la lista de clases válidas
  if (requestedClass && validClasses.includes(requestedClass)) {
    return true; // ¡Es válida! Permite el paso.
  }

  // 5. Si no es válida (es 'G' o cualquier otra cosa), redirige al inicio y bloquea
  console.error(`Error de Guardia: Clase de licencia inválida "${requestedClass}". Redirigiendo a inicio.`);
  router.navigate(['/']); // Redirige a la página principal
  return false; // Bloquea la navegación a /clase/G
};