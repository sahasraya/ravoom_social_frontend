import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import path from 'path';
import { LogInComponent } from './auth/log-in/log-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { HomeComponent } from './home/home.component';
import { FeedComponent } from './home/feed/feed.component';
import { CommentComponent } from './home/comment/comment.component';
import { ProfileComponent } from './home/profile/profile.component';
import { SettingsComponent } from './home/settings/settings.component';
import { SearchResultByEnterComponent } from './home/search-result-by-enter/search-result-by-enter.component';
import { NotificationComponent } from './home/notification/notification.component';
import { FollowersFeedComponent } from './home/followers-feed/followers-feed.component';
import { GroupsComponent } from './home/groups/groups.component';
import { EmailConfirmationUserSignUpComponent } from './auth/email-confirmation-user-sign-up/email-confirmation-user-sign-up.component';
import { ResetPasswordComponent } from './home/reset-password/reset-password.component';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password.component';
import { UserlistToFollowComponent } from './home/userlist-to-follow/userlist-to-follow.component';
import { VideoSliderComponent } from './home/video-slider/video-slider.component';
import { PrivacyPolicyComponent } from './home/privacy-policy/privacy-policy.component';
import { AttributesComponent } from './home/attributes/attributes.component';

export const routes: Routes = [

    { path: '',component:FeedComponent,    pathMatch: 'full' },
    {
        path:"auth",component:AuthComponent,children:[
             {   path:'log-in',component:LogInComponent,},
             {   path:'sign-up',component:SignUpComponent},
             {   path:'forget-password',component:ForgetPasswordComponent},
             {   path:'email-auth/:uid',component:EmailConfirmationUserSignUpComponent},
        ]
    },
    
    
    {
        path:"home",component:HomeComponent,children:[
            { path: 'followers-feed', component: FollowersFeedComponent }
        ]
    },

    {
        path:"home",component:HomeComponent,children:[
            { path: 'notification', component: NotificationComponent }
        ]
    },
    {
        path:"home",component:HomeComponent,children:[
            { path: 'reset-password', component: ResetPasswordComponent }
        ]
    },

    {
        path:"home",component:HomeComponent,children:[
            { path: 'slider', component: VideoSliderComponent }
        ]
    },

    {
        path:"home",component:HomeComponent,children:[
            { path: 'privacy-policy', component: PrivacyPolicyComponent }
        ]
    },

    {
        path:"home",component:HomeComponent,children:[
            { path: 'attributes', component: AttributesComponent }
        ]
    },




    

    {
        path: "home", component: HomeComponent, children: [
          { path: 'comment/:postid/:type/:screen/:uid', component: CommentComponent },
          { path: 'comment/:postid/:type/:screen', component: CommentComponent } 
        ]
      },
    {
        path:"home",component:HomeComponent,children:[
            { path: 'settings/:uid', component: SettingsComponent }
        ]
    },

    {
        path:"home",component:HomeComponent,children:[
            { path: 'profile/:uid', component: ProfileComponent }
        ]
    },
    {
        path:"home",component:HomeComponent,children:[
            { path: 'userlist-to-follow', component: UserlistToFollowComponent }
        ]
    },

    {
        path:"home",component:HomeComponent,children:[
            { path: 'result/:text', component: SearchResultByEnterComponent }
        ]
    },
    {
        path:"home",component:HomeComponent,children:[
            { path: 'group/:groupid', component: GroupsComponent }
        ]
    },

    {
        path:" ",component:HomeComponent
    } 

    
];
