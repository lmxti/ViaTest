import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { QuestionService } from '../../services/question.service'; 
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  totalQuestions$: Observable<number> | undefined;

  constructor(private questionService: QuestionService) {} 

  ngOnInit(): void {

    this.totalQuestions$ = this.questionService.getAllQuestions().pipe(
      map(questions => questions.length)
    );
  }
}