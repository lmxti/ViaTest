import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.errorMessage = '';

    // Llama al servicio que pegaste
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // ¡Éxito! El servicio ya guardó el token y emitió el estado.
        // Solo necesitamos redirigir.
        console.log('Login exitoso', response);
        this.router.navigate(['/']); // Redirige al Home
      },
      error: (err) => {
        // Muestra el error del backend (ej. "Credenciales inválidas")
        this.errorMessage = err.error.message || 'Error desconocido al iniciar sesión.';
        console.error('Error de login:', err);
      }
    });
  }
}