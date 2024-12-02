import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare global {
  interface Window {
    gapi: any;
  }
}

@Component({
  selector: 'app-google-auth',
  standalone:true,
  templateUrl: './google-auth.component.html',
  styleUrls: ['./google-auth.component.css']
})
export class GoogleAuthComponent implements OnInit {

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Load Google Sign-In button on page load
    this.loadGoogleApiScript().then(() => {
      this.loadGoogleSignInButton();
    }).catch(error => {
      console.error('Google API script failed to load', error);
    });
  }

  // Dynamically load the Google API script
  loadGoogleApiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        // If gapi is already loaded, resolve immediately
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/platform.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);

      document.head.appendChild(script);
    });
  }

  loadGoogleSignInButton() {
    // Check if gapi is available before calling load
    if (window.gapi) {
      window.gapi.load('auth2', () => {
        const auth2 = window.gapi.auth2.init({
          client_id: '901070769685-o08sp7oa9q92r1s1lk8drk716c5i07gb.apps.googleusercontent.com', // Your Google Client ID
        });

        auth2.attachClickHandler(document.getElementById('google-signin-button'), {},
          (googleUser: any) => this.onSignIn(googleUser),
          (error: any) => this.onSignInError(error)
        );
      });
    } else {
      console.error('gapi is not available');
    }
  }

  onSignIn(googleUser: any) {
    const idToken = googleUser.getAuthResponse().id_token;

    // Send the ID token to the backend for validation and user authentication
    this.http.post('http://your-backend-url/authentication_user_by_email', { idToken })
      .subscribe(response => {
        console.log('User authenticated', response);
        // Handle the successful authentication here (e.g., save user data, redirect, etc.)
      }, error => {
        console.error('Authentication failed', error);
      });
  }

  onSignInError(error: any) {
    console.error('Google sign-in error', error);
  }
}
