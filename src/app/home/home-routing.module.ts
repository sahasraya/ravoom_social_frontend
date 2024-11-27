import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedComponent } from './feed/feed.component';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home.component').then((m) => m.HomeComponent),
    children: [
      { path: '', component: FeedComponent, pathMatch: 'full' },
      {
        path: 'followers-feed',
        loadComponent: () => import('./followers-feed/followers-feed.component').then((m) => m.FollowersFeedComponent),
      },
      {
        path: 'notification',
        loadComponent: () => import('./notification/notification.component').then((m) => m.NotificationComponent),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
      },
      {
        path: 'slider',
        loadComponent: () => import('./video-slider/video-slider.component').then((m) => m.VideoSliderComponent),
      },
      {
        path: 'privacy-policy',
        loadComponent: () => import('./privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent),
      },
      {
        path: 'attributes',
        loadComponent: () => import('./attributes/attributes.component').then((m) => m.AttributesComponent),
      },
      {
        path: 'comment/:postid/:type/:screen/:uid',
        loadComponent: () => import('./comment/comment.component').then((m) => m.CommentComponent),
      },
      {
        path: 'comment/:postid/:type/:screen',
        loadComponent: () => import('./comment/comment.component').then((m) => m.CommentComponent),
      },
      {
        path: 'settings/:uid',
        loadComponent: () => import('./settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'profile/:uid',
        loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'userlist-to-follow',
        loadComponent: () => import('./userlist-to-follow/userlist-to-follow.component').then((m) => m.UserlistToFollowComponent),
      },
      {
        path: 'result/:text',
        loadComponent: () => import('./search-result-by-enter/search-result-by-enter.component').then((m) => m.SearchResultByEnterComponent),
      },
      {
        path: 'group/:groupid',
        loadComponent: () => import('./groups/groups.component').then((m) => m.GroupsComponent),
        runGuardsAndResolvers: 'pathParamsChange'
      },
    ],
  },
   
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
