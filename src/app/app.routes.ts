import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FeedComponent } from './home/feed/feed.component';

export const routes: Routes = [
  { path: '', component: FeedComponent, pathMatch: 'full', data: { reuseRoute: true } },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routing.module').then((m) => m.AuthRoutingModule),
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home-routing.module').then((m) => m.HomeRoutingModule),
  } 
];
