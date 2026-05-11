import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ArticleRequest {
  url: string;
  lang?: string;
  length?: number;
}

export interface ArticleSummary {
  id?: string;
  url: string;
  summary?: string;
  language: string;
  length: number;
  status: 'active' | 'inactive' | 'pending' | 'failed';
  errorMessage?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly apiUrl = '/api/articles';

  constructor(private http: HttpClient) {}

  create(request: ArticleRequest): Observable<ArticleSummary> {
    return this.http.post<ArticleSummary>(this.apiUrl, request);
  }

  getAll(): Observable<ArticleSummary[]> {
    return this.http.get<ArticleSummary[]>(this.apiUrl);
  }

  getById(id: string): Observable<ArticleSummary> {
    return this.http.get<ArticleSummary>(`${this.apiUrl}/${id}`);
  }

  getByStatus(status: string): Observable<ArticleSummary[]> {
    return this.http.get<ArticleSummary[]>(`${this.apiUrl}/status/${status}`);
  }

  softDelete(id: string): Observable<ArticleSummary> {
    return this.http.delete<ArticleSummary>(`${this.apiUrl}/${id}`);
  }

  restore(id: string): Observable<ArticleSummary> {
    return this.http.patch<ArticleSummary>(`${this.apiUrl}/${id}/restore`, {});
  }
}
