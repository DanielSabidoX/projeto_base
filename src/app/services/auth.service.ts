import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly API = 'http://localhost:3000';

  readonly isAuthenticated: WritableSignal<boolean> = signal(false);
  readonly accessToken: WritableSignal<string> = signal('');
  readonly refreshTokenValue: WritableSignal<string> = signal('');
  readonly http: HttpClient = inject(HttpClient);

  constructor() {}

  /* ============================================================
     LOGIN
     ============================================================ */
  login(email: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.API}/autenticacao/login`, { email, senha }).pipe(
      tap(res => {
        this.setSession(res.accessToken, res.refreshToken);
      })
    );
  }

  /* ============================================================
     SET SESSION
     ============================================================ */
  private setSession(accessToken: string, refreshToken: string) {
    this.accessToken.set(accessToken);
    this.refreshTokenValue.set(refreshToken);
    this.isAuthenticated.set(true);
  }

  /* ============================================================
     GET TOKEN
     ============================================================ */
  getToken(): string {
    return this.accessToken();
  }

  getRefreshToken(): string {
    return this.refreshTokenValue();
  }

  /* ============================================================
     REFRESH TOKEN (ALINHADO COM BACKEND)
     ============================================================ */
  refreshToken(): Observable<string> {
    return this.http.post<{ accessToken: string }>(
      `${this.API}/refresh-token`,
      { refreshToken: this.getRefreshToken() }
    ).pipe(
      tap(res => {
        // só atualiza access token
        this.accessToken.set(res.accessToken);
      }),
      map(res => res.accessToken),
      catchError(err => {
        // se refresh falhar → logout
        this.logout();
        return throwError(() => err);
      })
    );
  }

  /* ============================================================
     LOGOUT
     ============================================================ */
  logout() {
    this.http.post(`${this.API}/logout`, {
      refreshToken: this.getRefreshToken()
    }).subscribe();

    this.accessToken.set('');
    this.refreshTokenValue.set('');
    this.isAuthenticated.set(false);
  }
}