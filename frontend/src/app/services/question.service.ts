import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Question } from '../models/question.model'; // 👈 Importa el modelo

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:3000/api/questions';

  constructor(private http: HttpClient) {}

  getAllQuestions(classType: string = 'B'): Observable<Question[]> {
    let params = new HttpParams().set('classType', classType.toUpperCase());
    return this.http.get<Question[]>(this.apiUrl, { params: params }).pipe(
      tap(q => console.log(`QuestionService: getAllQuestions(${classType}) - ${q?.length} recibidas`)),
      catchError(err => { console.error('Error en getAllQuestions:', err); return of([]); })
    );
  }

  getTestQuestions(count: number, classType: string = 'B'): Observable<Question[]> {
    let params = new HttpParams().set('classType', classType.toUpperCase());
    return this.http.get<Question[]>(this.apiUrl, { params: params }).pipe(
      tap(q => console.log(`QuestionService: getTestQuestions(${classType}) - ${q?.length} recibidas`)),
      map(questions => {
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      }),
      catchError(err => { console.error('Error en getTestQuestions:', err); return of([]); })
    );
  }

  getQuestionById(id: string): Observable<Question> {
    return this.http.get<Question>(`${this.apiUrl}/${id}`);
  }

  addQuestion(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  updateQuestion(id: string, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }
}