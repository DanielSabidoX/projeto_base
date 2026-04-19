import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  readonly isAuthenticated: WritableSignal<boolean> = signal(true);
  readonly token: WritableSignal<string> = signal('');


  constructor() { }

}
