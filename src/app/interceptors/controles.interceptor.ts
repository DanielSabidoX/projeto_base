import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const controlesInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  const authService = inject(AuthService);

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

  return next(authReq).pipe(
    finalize(() => loading.hide())
  );
};
