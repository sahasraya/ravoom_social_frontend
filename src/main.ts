import { bootstrapApplication } from '@angular/platform-browser';
 
import { provideRouter } from '@angular/router';
 
import { RouteReuseStrategy } from '@angular/router';
import { AppComponent } from './app/app.component';
import { CustomReuseStrategy } from './app/services/custom-route-reuse-strategy';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';

// Bootstrap the application and configure routing
bootstrapApplication(AppComponent, {
  providers: [
    // Provide the route reuse strategy
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    provideRouter(routes), // your route configuration
    provideHttpClient()
  ],
}).catch((err) => console.error(err));
