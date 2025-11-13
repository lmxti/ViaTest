import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, | date, | async
import { ActivatedRoute, RouterLink } from '@angular/router'; // Para leer URL y crear enlace "Volver"
import { HistoryService } from '../../services/history.service'; // Importamos el servicio
import { TestDetailResponse } from '../../models/history.model'; // Importamos la interfaz
import { Observable, switchMap, tap } from 'rxjs'; // Importamos RxJS
import { Question } from '../../models/question.model'; // Importamos el modelo Question

@Component({
  selector: 'app-test-detail',
  standalone: true,
  imports: [CommonModule, RouterLink], // Añadimos RouterLink
  templateUrl: './test-detail.component.html',
  styleUrls: ['./test-detail.component.css']
})
export class TestDetailComponent implements OnInit {
  
  testDetail$: Observable<TestDetailResponse> | undefined;
  isLoading = true;
  // Objeto para rastrear la visibilidad de las explicaciones
  explanationVisibility: { [key: number]: boolean } = {};
  // Guardará la clase del test (ej. 'B') para el enlace "Volver"
  classType: string = 'B'; 

  constructor(
    private route: ActivatedRoute,
    private historyService: HistoryService
  ) {}

  ngOnInit(): void {
    this.testDetail$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          console.error('ID de historial no encontrado en la URL');
          throw new Error('ID de historial no encontrado');
        }
        this.isLoading = true;
        // Llamamos al método del servicio que obtiene los detalles
        return this.historyService.getTestDetail(id);
      }),
      tap(testDetail => {
        this.isLoading = false;
        // Guardamos la clase del test para el botón "Volver"
        if (testDetail.summary.license_class) {
          this.classType = testDetail.summary.license_class;
        }
        console.log('Detalles del test cargados:', testDetail);
      })
    );
  }

  /**
   * Verifica si una opción específica fue la que respondió el usuario.
   */
  wasUserAnswer(optionLetter: string, userAnswer: string | string[] | null): boolean {
    if (userAnswer === null) return false;
    if (Array.isArray(userAnswer)) {
      return userAnswer.includes(optionLetter);
    }
    return optionLetter === userAnswer;
  }

  /**
   * Verifica si una opción es la respuesta correcta oficial.
   */
  isCorrectAnswer(optionLetter: string, correctAnswer: string | string[]): boolean {
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.includes(optionLetter);
    }
    return optionLetter === correctAnswer;
  }

  /**
   * Muestra u oculta la explicación de una pregunta.
   */
  toggleExplanation(questionId: number): void {
    this.explanationVisibility[questionId] = !this.explanationVisibility[questionId];
  }
}