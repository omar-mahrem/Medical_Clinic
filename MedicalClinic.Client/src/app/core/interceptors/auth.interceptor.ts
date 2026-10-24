import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let authReq = req;
  const isApiRequest = !req.url.startsWith('http') || 
                       (typeof window !== 'undefined' && req.url.includes(window.location.host)) ||
                       req.url.includes('localhost:5000') || 
                       req.url.includes('localhost:5246');

  if (token && isApiRequest) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 Unauthorized on authenticated request, try refreshing token
      if (error.status === 401 && !req.url.includes('/auth') && token) {
        return authService.refreshToken().pipe(
          switchMap((newAuth) => {
            const retriedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAuth.token}`
              }
            });
            return next(retriedReq);
          }),
          catchError((refreshErr) => {
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
