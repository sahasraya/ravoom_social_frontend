import { RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FeedComponent } from './home/feed/feed.component';
import { CustomReuseStrategy } from './services/custom-route-reuse-strategy';  

export const routes: Routes = [
  { path: '', component: FeedComponent, pathMatch: 'full', data: { reuseRoute: true } },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-routing.module').then((m) => m.AuthRoutingModule),
    data: { reuseRoute: true },
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home-routing.module').then((m) => m.HomeRoutingModule),
    data: { reuseRoute: true },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: CustomReuseStrategy, 
    },
  ],
})
export class AppRoutingModule {}
