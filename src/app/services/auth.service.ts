import { Injectable, signal, WritableSignal } from '@angular/core';
import { delay, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly isAuthenticated: WritableSignal<boolean> = signal(true);
  readonly token: WritableSignal<string> = signal('token-inicial');

  constructor() { }

  refreshToken() {
    return of('novo-token').pipe(
      delay(500), // simula requisição
      tap(token => this.setToken(token))
    );
  }

  setToken(token: string) {
    this.token.set(token);
    this.isAuthenticated.set(true);
  }

  logout() {
    this.token.set('');
    this.isAuthenticated.set(false);
  }

  login(username: string, password: string) {
    // Simula uma autenticação bem-sucedida
    this.token.set('token-de-autenticacao');
    this.isAuthenticated.set(true);
  }

}
