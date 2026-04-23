import { Routes } from '@angular/router';
import { Auth } from './auth.page';

export const routes: Routes = [
  {
    path: '',
    component: Auth,
    children: [
      {
        path: 'login',
        loadComponent: () =>
        import('./components/login/login.page').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
        import('./components/register/register.page').then((m) => m.Register),
      }
    ],
  },
  
];
