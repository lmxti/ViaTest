import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, async
import { RouterModule } from '@angular/router'; // Para routerLink
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service'; // Importa el servicio

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule], // Añade CommonModule y RouterModule
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  
  // Variable pública para que el HTML pueda acceder al stream
  isLoggedIn$: Observable<boolean>;

  constructor(private authService: AuthService) {
    // Asigna el observable público del servicio
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  // Método para el botón de "Cerrar Sesión"
  onLogout(): void {
    this.authService.logout();
  }
}