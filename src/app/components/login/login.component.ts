import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  authService: AuthService = inject(AuthService);
  route: Router = inject(Router);

  constructor() { 
    this.login();

  }

  login() {
    if(this.authService.isAuthenticated()) {
      this.route.navigate(['/']);
    }
  }

}
