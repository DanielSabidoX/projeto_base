import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  let router = inject(Router);
  let authService = inject(AuthService);

  // Verifique a autenticação usando o serviço AuthService
  let isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirecione para a página de login
    router.navigate(['/login']);
    return false; // Impede o acesso à rota protegida
  }
    
  return true;
};
