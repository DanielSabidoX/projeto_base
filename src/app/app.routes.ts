import { Routes } from '@angular/router';
import { HomeComponent } from './components/page/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Rotas públicas
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
    },
    // Rotas privadas
    {
        path: '',
        component: HomeComponent,
        title: 'Home',
        canActivate: [authGuard]
    },
    // Rota para lidar com caminhos não encontrados
    {
        path: '**', 
        redirectTo: 'login',
    }

];
