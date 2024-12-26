declare var google: any;
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-google-auth-log-in',
  standalone: true,
  imports: [],
  templateUrl: './google-auth-log-in.component.html',
  styleUrl: './google-auth-log-in.component.css'
})
export class GoogleAuthLogInComponent implements OnInit {


    APIURL = environment.APIURL;
    
    constructor(private http: HttpClient, private router: Router) {}
  
    ngOnInit(): void {
      google.accounts.id.initialize({
        client_id: '901070769685-o08sp7oa9q92r1s1lk8drk716c5i07gb.apps.googleusercontent.com',
        callback: (resp: any) => this.handleLogin(resp)
      });
  
      google.accounts.id.renderButton(document.getElementById("google-btn"), {
        theme: 'filled_blue',
        size: 'large',
        shape: 'rectangle',
        window: 350
      });
    }
  
  
  
  
    handleLogin(response: any) {
      if (response) {
        const jwtToken = response.credential;
        localStorage.setItem('jwt', jwtToken);
    
        const payLoad = this.decodeToken(jwtToken);
        const formData = new FormData();
        formData.append('emailaddress', payLoad.email);
    
        this.http.post(this.APIURL + 'log-in-with-google', formData).subscribe({
          next: (response: any) => {
             if (response.message === "Email address already exists") {
              // Set local storage data and userid from response
              localStorage.setItem('ppd', 'no');
              localStorage.setItem('name', 'normal');
              localStorage.setItem('core', 'never');
              localStorage.setItem('appd', 'AkfwpkfpMMkwppge');
              localStorage.setItem('ud', 'AASfeeg2332Afwfafwa');
              localStorage.setItem('s', '2');
              localStorage.setItem('g', '34');
              localStorage.setItem('21', '5g2');
              localStorage.setItem('cap', 'np');
              localStorage.setItem('uid', 'Jfwgw2wfAfwawwgAd');
              localStorage.setItem('doc', '25');
              localStorage.setItem('wmd', response.userid);
              localStorage.setItem('ger', '30491aDdwqf');
              localStorage.setItem('fat', 'new set');
              localStorage.setItem('mainsource', 'web');
              localStorage.setItem('ud', 'no');
              localStorage.setItem('www', '34');
              localStorage.setItem('reload', 'false');
              localStorage.setItem('signupwithgmail', 'true');
    
              // Hard reload the page to apply changes
              window.location.href = '/';
            } else if (response.message === "Please confirm the email") {
              alert("Please confirm your email address.");
            } else if (response.message === "No user found") {
               alert("No user found with this email address.");
               this.router.navigate(['/auth/sign-up']);
            }
            
          },
          error: (error) => {
            console.error('There was an error!', error);
            alert('An error occurred. Please try again later.');
          }
        });
    
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
