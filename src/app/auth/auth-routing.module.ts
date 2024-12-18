import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth.component').then((m) => m.AuthComponent), 
    children: [
      { path: 'log-in', loadComponent: () => import('./log-in/log-in.component').then((m) => m.LogInComponent) },
      { path: 'g-auth', loadComponent: () => import('./google-auth/google-auth.component').then((m) => m.GoogleAuthComponent) },
      { path: 'sign-up', loadComponent: () => import('./sign-up/sign-up.component').then((m) => m.SignUpComponent) },
      { path: 'forget-password', loadComponent: () => import('./forget-password/forget-password.component').then((m) => m.ForgetPasswordComponent) },
      { path: 'email-auth/:uid', loadComponent: () => import('./email-confirmation-user-sign-up/email-confirmation-user-sign-up.component').then((m) => m.EmailConfirmationUserSignUpComponent) },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
