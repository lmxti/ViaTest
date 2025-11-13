import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'conduccionapp_token'; // Clave para guardar en localStorage

  // --- 👇 AÑADE ESTAS LÍNEAS ---
  // 1. Creamos el "emisor" de estado.
  // Inicia como 'false' (no logueado) al cargar la app.
  private loggedInStatus = new BehaviorSubject<boolean>(this.hasToken());
  // 2. Creamos un Observable público para que los componentes se suscriban.
  isLoggedIn$ = this.loggedInStatus.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  // Método simple para verificar si hay un token al inicio
  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  // Registrar un nuevo usuario
  register(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }

  // Iniciar sesión
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      // 'tap' nos permite "espiar" la respuesta sin modificarla
      tap((response: any) => {
        // Si el login es exitoso, guardamos el token
        if (response.token) {
          this.saveToken(response.token);
          this.loggedInStatus.next(true); // Actualizamos el estado
        }
      })
    );
  }

  // Guardar el token en localStorage
  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Obtener el token de localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.loggedInStatus.next(false);
    this.router.navigate(['/login']); // Redirigir al login
  }
}