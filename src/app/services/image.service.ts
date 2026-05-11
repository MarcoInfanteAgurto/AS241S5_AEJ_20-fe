import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImageRequest {
  prompt: string;
  styleId?: number;
  size?: string;
}

export interface ImageRecord {
  id?: string;
  prompt: string;
  imageUrl?: string;
  styleId?: number;
  size: string;
  status: 'pending' | 'generated' | 'failed';
  errorMessage?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly apiUrl = '/api/images';

  constructor(private http: HttpClient) {}

  create(request: ImageRequest): Observable<ImageRecord> {
    return this.http.post<ImageRecord>(this.apiUrl, request);
  }

  getAll(): Observable<ImageRecord[]> {
    return this.http.get<ImageRecord[]>(this.apiUrl);
  }

  getById(id: string): Observable<ImageRecord> {
    return this.http.get<ImageRecord>(`${this.apiUrl}/${id}`);
  }

  getByStatus(status: string): Observable<ImageRecord[]> {
    return this.http.get<ImageRecord[]>(`${this.apiUrl}/status/${status}`);
  }

}
