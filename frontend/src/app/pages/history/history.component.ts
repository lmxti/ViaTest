import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, etc.
import { ActivatedRoute, RouterLink } from '@angular/router'; // Para leer URL y crear enlaces
import { HistoryService } from '../../services/history.service'; // Importa el servicio y la interfaz
import { TestResult } from '../../models/history.model';
import { Observable, switchMap, tap } from 'rxjs'; // Importa RxJS

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink], // Añade RouterLink
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  // Usaremos un observable para manejar la lista
  history$: Observable<TestResult[]> | undefined;
  isLoading = true;
  currentClassType: string = 'B'; // Para el título

  constructor(
    private historyService: HistoryService,
    private route: ActivatedRoute // Para leer el parámetro de la URL
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    // Lee el parámetro :classType de la URL
    this.history$ = this.route.paramMap.pipe(
      switchMap(params => {
        const classType = params.get('classType') || 'B'; // Default a 'B'
        this.currentClassType = classType.toUpperCase(); // Guarda para el título

        // Llama al servicio con la clase correcta
        return this.historyService.getHistory(classType);
      }),
      tap(() => {
        this.isLoading = false; // Oculta el spinner cuando los datos llegan
      })
    );
  }
}