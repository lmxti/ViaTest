import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 👇 Importa todo lo necesario para formularios reactivos y rutas
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router'; // 👈 Importa ActivatedRoute
import { switchMap } from 'rxjs'; // 👈 Importa switchMap

// Tus modelos y servicios
import { QuestionService } from '../../services/question.service';
import { Question } from '../../models/question.model';
import { HistoryService } from '../../services/history.service';
import { DetailedTestResultPayload } from '../../models/history.model';


@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Asegúrate de tener ReactiveFormsModule
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  questions: Question[] = [];
  testForm: FormGroup;
  isLoading = true;
  currentClassType: string = 'B'; // Guardará la clase del test actual (ej. 'B')

  constructor(
    private questionService: QuestionService,
    private fb: FormBuilder,
    private router: Router,
    private historyService: HistoryService,
    private route: ActivatedRoute // 👈 Inyecta ActivatedRoute
  ) {
    this.testForm = this.fb.group({});
  }

  ngOnInit(): void {
    console.log('TestComponent: ngOnInit iniciado');
    this.isLoading = true;

    // Escucha el parámetro :classType de la URL
    this.route.paramMap.pipe(
      switchMap(params => {
        // 1. Obtiene el 'classType' (ej: 'b') o usa 'B' por defecto
        this.currentClassType = params.get('classType')?.toUpperCase() || 'B';
        console.log(`TestComponent: Cargando test para Clase ${this.currentClassType}`);

        // 2. Llama al servicio con la clase y el número de preguntas
        // TODO: Ajusta el '35' si el número de preguntas cambia por clase
        return this.questionService.getTestQuestions(35, this.currentClassType); 
      })
    ).subscribe({
      next: (questionsData) => {
        console.log('TestComponent: Preguntas recibidas:', questionsData?.length);
        this.questions = questionsData || [];

        // 3. Construye el formulario basado en las preguntas recibidas
        this.buildForm();
        this.isLoading = false;
        console.log('TestComponent: Formulario construido');
      },
      error: (err) => {
        console.error('TestComponent: Error cargando preguntas:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Construye los controles del formulario dinámicamente.
   */
  private buildForm(): void {
    // Limpia controles antiguos si existieran
    Object.keys(this.testForm.controls).forEach(key => {
      this.testForm.removeControl(key);
    });

    // Crea nuevos controles
    this.questions.forEach(question => {
      if (question.multi) {
        // Grupo de checkboxes para preguntas múltiples
        const multiControlGroup = this.fb.group({});
        question.options.forEach(option => {
          multiControlGroup.addControl(option.letter, this.fb.control(false));
        });
        multiControlGroup.setValidators(this.minOneCheckboxChecked());
        this.testForm.addControl(question.id.toString(), multiControlGroup);
      } else {
        // Control de radio para preguntas únicas (requerido)
        this.testForm.addControl(question.id.toString(), this.fb.control(null, Validators.required));
      }
    });
  }

  /**
   * Validador personalizado para asegurar que al menos un checkbox esté marcado.
   */
  private minOneCheckboxChecked(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      if (formGroup instanceof FormGroup) {
        const hasSelection = Object.values(formGroup.value).some(v => v === true);
        return hasSelection ? null : { requireOneCheckbox: true };
      }
      return null;
    };
  }

  /**
   * Se ejecuta al enviar el test.
   */
  onSubmit(): void {
    if (this.testForm.invalid) {
      console.warn('Formulario inválido');
      this.testForm.markAllAsTouched();
      return;
    }

    const userAnswers = this.testForm.value;
    let calculatedScore = 0;
    const totalQuestions = this.questions.length;

    // 1. Calcular puntaje
    this.questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      let correct = false;

      if (question.multi) {
        const correctAnswers = question.correctAnswer as string[];
        if (typeof userAnswer === 'object' && userAnswer !== null) {
          const selectedLetters = Object.keys(userAnswer).filter(key => userAnswer[key]);
          if (correctAnswers.length === selectedLetters.length && correctAnswers.every(el => selectedLetters.includes(el))) {
            correct = true;
          }
        }
      } else {
        if (String(userAnswer) === question.correctAnswer) {
          correct = true;
        }
      }

      if (correct) {
        calculatedScore += question.points || 1;
      }
    });
    console.log(`Puntaje calculado: ${calculatedScore}`);

    // 2. Determinar aprobación (ajusta '33' si es necesario por clase)
    const isApproved = calculatedScore >= 33; 

    // 3. Preparar payload para el historial
    const payload: DetailedTestResultPayload = {
      score: calculatedScore,
      totalQuestions: totalQuestions,
      status: isApproved ? 'Aprobado' : 'Reprobado',
      questions: this.questions,
      userAnswers: userAnswers,
      classType: this.currentClassType // 👈 Guardamos la clase del test
    };

    // 4. Guardar y redirigir
    this.historyService.addTestResult(payload).subscribe({
      next: (response) => {
        console.log('Historial guardado, respuesta:', response);
        this.router.navigate(['/historial/details', response.id]); // 👈 Redirige al detalle
      },
      error: (err) => {
        console.error('Error al guardar el historial:', err);
        alert('Hubo un error al guardar tu resultado.');
      }
    });
  }
}