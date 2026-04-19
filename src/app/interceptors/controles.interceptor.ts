import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { catchError, finalize, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const controlesInterceptor: HttpInterceptorFn = (req, next) => {

  const loading = inject(LoadingService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  let authReq = req;

  // não adiciona token em login/refresh
  if (
    token &&
    !req.url.includes('/autenticacao/login') &&
    !req.url.includes('/refresh-token')
  ) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  loading.show();

  return next(authReq).pipe(

    catchError((error: HttpErrorResponse) => {

      // evita loop infinito (não tenta refresh na própria rota)
      if (
        error.status === 401 &&
        !req.url.includes('/refresh-token') &&
        !req.url.includes('/autenticacao/login')
      ) {

        return authService.refreshToken().pipe(

          switchMap((newToken: string) => {

            // NÃO precisa setToken (service já faz)

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            return next(retryReq);
          }),

          catchError(() => {
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    }),

    finalize(() => loading.hide())
  );
};