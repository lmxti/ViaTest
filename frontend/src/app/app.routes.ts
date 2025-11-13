import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component'; //# Componente pagina de inicio
import { LoginComponent } from './pages/login/login.component'; //# Componente pagina de inicio de sesión
import { RegisterComponent } from './pages/register/register.component'; //# Componente pagina de registro

import { ClassDashboardComponent } from './pages/class-dashboard/class-dashboard.component';
import { TestComponent } from './pages/test/test.component';

import { HistoryComponent } from './pages/history/history.component';
import { TestDetailComponent } from './pages/test-detail/test-detail.component';


import { AnswerGuideComponent } from './pages/answer-guide/answer-guide.component';

import { authGuard } from './guards/auth.guard';
import { licenseClassGuard } from './guards/license-class.guard';


export const routes: Routes = [
    // --- Rutas públicas --- //
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    // --- Rutas protegidas --- //
    { path: 'clase/:classType', component: ClassDashboardComponent, canActivate: [authGuard, licenseClassGuard] },
    { path: 'test/:classType', component: TestComponent, canActivate: [authGuard, licenseClassGuard] },

    { path: 'historial/:classType', component: HistoryComponent, canActivate: [authGuard, licenseClassGuard] },
    { path: 'historial/details/:id', component: TestDetailComponent, canActivate: [authGuard] },

    { path: 'answer-guide/:classType', component: AnswerGuideComponent, canActivate: [licenseClassGuard] },
];
