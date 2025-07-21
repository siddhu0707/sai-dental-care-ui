import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService {
  private baseUrl = 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  checkApiHealth(): Observable<boolean> {
    return this.http.get(`${this.baseUrl}/patients`).pipe(
      map(() => true),
      catchError(() => {
        console.warn('API Health Check Failed - JSON Server may not be running');
        return [false];
      })
    );
  }

  testConnection(): void {
    this.checkApiHealth().subscribe(isHealthy => {
      if (isHealthy) {
        console.log('✅ API Connection Successful - JSON Server is running');
      } else {
        console.error('❌ API Connection Failed - Check if JSON Server is running on port 3001');
      }
    });
  }
}
