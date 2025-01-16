declare var google: any;
import { Component, OnInit } from '@angular/core'; 
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare global {
  interface Window {
    gapi: any;
  }
}

@Component({
  selector: 'app-google-auth',
  standalone: true,
  templateUrl: './google-auth.component.html',
  styleUrls: ['./google-auth.component.css']
})
export class GoogleAuthComponent implements OnInit {
  APIURL = environment.APIURL;
  
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: '901070769685-o08sp7oa9q92r1s1lk8drk716c5i07gb.apps.googleusercontent.com',
      callback: (resp: any) => this.handelLogin(resp)
    });

    google.accounts.id.renderButton(document.getElementById("google-btn"), {
      theme: 'filled_blue',
      size: 'large',
      shape: 'rectangle',
      window: 350
    });
  }

  handelLogin(response: any) {
    if (response) {
      const jwtToken = response.credential; 
      
      localStorage.setItem('jwt', jwtToken); 

      const payLoad = this.decodeToken(jwtToken);  
      
      const formData = new FormData();
      formData.append('username', payLoad.name);
      formData.append('birthdate', '1990-01-01');  
      formData.append('emailaddress', payLoad.email);
      formData.append('profileimage', payLoad.picture);

  
      this.http.post(this.APIURL + 'sign-up-with-google', formData).subscribe({
        next: (response: any) => {
   
          if (response.message === "Email address already exists") {

            alert("Email address already exists");
          } 
          else if (response.message === "User created successfully" ) {
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
            window.location.href = 'https://www.ravoom.com/';
          }
        },
        error: (error) => {
          console.error('There was an error!', error);
          if (error.status === 400) {
 

            alert('This Email address already exists');
            
          } else {
            alert('An error occurred. Please try again later.');
          }
        }
      });

      console.log('Logged In User Details:', payLoad);
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
