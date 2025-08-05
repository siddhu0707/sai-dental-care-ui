import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);
        
        if (error.status === 0) {
          console.error('Network error - Backend server may not be running on port 8080');
        } else if (error.status >= 400 && error.status < 500) {
          console.error('Client error:', error.message);
        } else if (error.status >= 500) {
          console.error('Server error:', error.message);
        }
        
        return throwError(() => error);
      })
    );
  }
}
