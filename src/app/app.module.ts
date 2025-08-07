import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { GtagModule } from 'angular-gtag';

import { AppComponent } from './app.component'; // Import the standalone component


@NgModule({
  declarations: [AppComponent],  
  imports: [
    BrowserModule,
    HttpClientModule,
    GtagModule.forRoot({ trackingId: 'G-QNK5BT8Y1R', trackPageviews: true })
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
