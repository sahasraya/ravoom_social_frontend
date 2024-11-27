import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component'; // Import the standalone component
import { HttpClient, HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],  
  imports: [BrowserModule,HttpClientModule],
  providers: [],
  bootstrap: [], 
})
export class AppModule {}
