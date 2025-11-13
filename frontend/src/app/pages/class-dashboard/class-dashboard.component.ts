import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, pipe async
import { ActivatedRoute, RouterLink } from '@angular/router'; // Para leer URL y crear enlaces
import { Observable, map, BehaviorSubject } from 'rxjs'; // Importar BehaviorSubject
import { HistoryService } from '../../services/history.service'; // 👈 Importar HistoryService
import { TestStats } from '../../models/history.model'; // 👈 Importar la interfaz de Stats

@Component({
  selector: 'app-class-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], // Importa CommonModule y RouterLink
  templateUrl: './class-dashboard.component.html',
  styleUrls: ['./class-dashboard.component.css']
})
export class ClassDashboardComponent implements OnInit { // Implementa OnInit
  
  classType$: Observable<string | null> | undefined; // Observable para el tipo de clase (ej: 'b')
  title: string = 'Panel de Clase'; // Título de la página

  // 👇 --- Añadir propiedades para las métricas --- 👇
  // BehaviorSubject para guardar los datos crudos de las estadísticas
  stats$ = new BehaviorSubject<TestStats>({ totalRealizados: 0, totalAprobados: 0 });
  // BehaviorSubject para el porcentaje calculado
  approvalPercentage$ = new BehaviorSubject<number>(0);
  // 👆 --- Fin de propiedades para métricas --- 👆

  constructor(
    private route: ActivatedRoute, // Para leer la URL
    private historyService: HistoryService // 👈 Inyectar HistoryService
  ) {}

  ngOnInit(): void {
    // Leemos el parámetro :classType de la URL
    this.classType$ = this.route.paramMap.pipe(
      map(params => params.get('classType'))
    );

    // Nos suscribimos a los cambios del tipo de clase
    this.classType$.subscribe(type => {
      if (type) {
        // 1. Actualizamos el título
        this.title = `Panel Clase ${type.toUpperCase()}`;
        
        // 2. Cargamos las estadísticas para esta clase
        this.historyService.getStats(type).subscribe(data => {
          this.stats$.next(data); // Emitimos los datos crudos
          
          // 3. Calculamos y emitimos el porcentaje
          if (data.totalRealizados > 0) {
            const percentage = (data.totalAprobados / data.totalRealizados) * 100;
            this.approvalPercentage$.next(Math.round(percentage)); // Redondeado
          } else {
            this.approvalPercentage$.next(0); // 0 si no hay tests
          }
        });
      }
    });
  }
  
  // Función auxiliar para obtener el nombre completo (ej: "Automóviles")
  getClassName(type: string | null): string {
    switch (type?.toUpperCase()) {
      case 'B': return 'Automóviles';
      case 'C': return 'Motocicletas';
      // Añadir más casos
      default: return '';
    }
  }
}