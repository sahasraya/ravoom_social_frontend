declare var google: any;
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
 

@Component({
  selector: 'app-auth-result',
  standalone: true,
  imports: [],
  templateUrl: './auth-result.component.html',
  styleUrl: './auth-result.component.css'
})
export class AuthResultComponent {
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize Google Sign-In
    google.accounts.id.initialize({
      client_id: '901070769685-o08sp7oa9q92r1s1lk8drk716c5i07gb.apps.googleusercontent.com',
      callback: (response: any) => this.handleLogin(response)
    });
  }

  // Handle button click event to trigger Google authentication
  onGoogleAuthClick(): void {
    google.accounts.id.prompt();
  }

  handleLogin(response: any): void {
    if (response && response.credential) {
      const jwtToken = response.credential;
      const userInfo = this.decodeToken(jwtToken); // Assuming the JWT contains user info
      
      // Pass the token and user information as queryParams to 'auth-result'
      this.router.navigate(['/auth/auth-result'], {
        queryParams: {
          token: jwtToken,
          username: userInfo.name,
          email: userInfo.email,
          profileImage: userInfo.picture,
        }
      });
    } else {
      alert('No token received. Please try again.');
    }
  }

  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
