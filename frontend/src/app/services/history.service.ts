import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
// 👇 Importa todas las interfaces, incluyendo la nueva TestStats
import {
  TestResult,
  DetailedTestResultPayload,
  TestHistorySummary,
  TestDetailResponse,
  TestStats 
} from '../models/history.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = 'http://localhost:3000/api/history';

  constructor(private http: HttpClient) { }

  getHistory(classType: string): Observable<TestResult[]> { // 👈 classType ahora es requerido
      const url = `${this.apiUrl}/${classType}`; // 👈 Construye la URL (ej: /api/history/B)
      console.log('HistoryService: llamando a GET', url);
      return this.http.get<TestResult[]>(url).pipe(
        catchError(err => { console.error('Error en getHistory:', err); return of([]); })
      );
  }

  addTestResult(result: DetailedTestResultPayload): Observable<TestHistorySummary> {
    return this.http.post<TestHistorySummary>(this.apiUrl, result);
  }

  getTestDetail(historyId: string): Observable<TestDetailResponse> {
    const url = `${this.apiUrl}/details/${historyId}`; // ❗️ Asegúrate que esta ruta coincida con tu backend
    return this.http.get<TestDetailResponse>(url).pipe(
      catchError(err => { 
        console.error('Error en getTestDetail:', err); 
        throw new Error('No se pudieron cargar los detalles del test.');
      })
    );
  }

  // 👇 --- AÑADE ESTE MÉTODO --- 👇
  /**
   * Obtiene las estadísticas de tests (realizados vs aprobados) para una clase.
   */
  getStats(classType: string): Observable<TestStats> {
    const url = `${this.apiUrl}/stats/${classType}`;
    console.log('HistoryService: llamando a GET', url);
    return this.http.get<TestStats>(url).pipe(
      catchError(err => {
        console.error(`Error al cargar estadísticas para ${classType}:`, err);
        // Devuelve un objeto por defecto si falla para no romper el dashboard
        return of({ totalRealizados: 0, totalAprobados: 0 }); 
      })
    );
  }
}