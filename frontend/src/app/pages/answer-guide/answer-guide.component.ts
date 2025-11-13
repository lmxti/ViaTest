import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor
import { ActivatedRoute } from '@angular/router'; // 👈 Importa ActivatedRoute
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms'; // Para filtros
import { Question } from '../../models/question.model';
import { QuestionService } from '../../services/question.service';
import { Category, CategoryService } from '../../services/category.service';
import { startWith } from 'rxjs/operators'; // 👈 Importa startWith

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-answer-guide',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Añade ReactiveFormsModule
  templateUrl: './answer-guide.component.html',
  styleUrls: ['./answer-guide.component.css']
})
export class AnswerGuideComponent implements OnInit {
  allQuestions: Question[] = []; // Lista completa de la BD
  filteredQuestions: Question[] = []; // Lista que se muestra
  categories: Category[] = []; // Para el <select>
  filterForm: FormGroup;
  isLoading = true;
  currentClassType: string = 'B'; // Para el título

  // Objeto para rastrear la visibilidad de las explicaciones
  detailsVisibility: { [key: number]: boolean } = {};

  constructor(
    private questionService: QuestionService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private route: ActivatedRoute // 👈 Inyecta ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      searchText: ['']
    });
  }

  ngOnInit(): void {
    this.isLoading = true;

    // 1. Cargar las categorías para el filtro
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
      console.log('AnswerGuide: Categorías cargadas');
    });

    // 2. Leer el classType de la URL
    // Usamos 'snapshot' porque no esperamos que cambie mientras estamos en la página
    this.currentClassType = this.route.snapshot.paramMap.get('classType')?.toUpperCase() || 'B';
    console.log(`AnswerGuide: Cargando guía para Clase ${this.currentClassType}`);

    // 3. Cargar las preguntas para ESA clase
    this.questionService.getAllQuestions(this.currentClassType).subscribe(questions => {
      this.allQuestions = questions;
      this.filteredQuestions = questions; // Inicialmente mostrar todas
      this.isLoading = false;
      console.log(`AnswerGuide: ${questions.length} preguntas cargadas`);
    });

    // 4. Escuchar cambios en los filtros
    this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value) // Emite el valor inicial (vacío)
    ).subscribe(filters => {
      this.applyFilters(filters);
    });
  }

  /**
   * Aplica los filtros del formulario a la lista de preguntas.
   */
  private applyFilters(filters: any): void {
    let tempFiltered = [...this.allQuestions]; // Empieza con la lista completa

    // Filtrar por categoría
    if (filters.category) {
      tempFiltered = tempFiltered.filter(q => q.category === filters.category);
    }

    // Filtrar por texto
    if (filters.searchText) {
      const searchTerm = filters.searchText.toLowerCase().trim();
      tempFiltered = tempFiltered.filter(q =>
        q.text.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredQuestions = tempFiltered; // Actualiza la lista visible
  }

  /**
   * Muestra u oculta los detalles (respuesta/explicación) de una pregunta.
   */
  toggleDetails(questionId: number): void {
    this.detailsVisibility[questionId] = !this.detailsVisibility[questionId];
  }

  /**
   * Verifica si una opción es la respuesta correcta.
   */
  isCorrect(optionLetter: string, correctAnswer: string | string[]): boolean {
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.includes(optionLetter);
    }
    return optionLetter === correctAnswer;
  }
}