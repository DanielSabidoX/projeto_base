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
  const token = authService.token();

  let authReq = req;

  // Adiciona o token de autenticação ao cabeçalho da requisição, se disponível
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // padrão JWT
      }
    });
  } 

  // Exibe o loading antes de enviar a requisição
  loading.show();

  // Envia a requisição e trata erros de autenticação
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {
        // tenta renovar
        return authService.refreshToken().pipe(
          switchMap((newToken: string) => {
            // salva novo token
            authService.setToken(newToken);

            // refaz a request original com novo token
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });

            return next(retryReq);
          }),
          catchError(() => {
            // refresh falhou → logout
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
