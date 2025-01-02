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
  
 
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize any necessary configurations, if needed, but no need for Google SDK now
  }

  // Handle the click event to navigate to the Google OAuth URL
  onGoogleAuthClick(): void {
    // Define the Google OAuth URL with the relevant query parameters
    const googleOAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?' +
      'client_id=901070769685-o08sp7oa9q92r1s1lk8drk716c5i07gb.apps.googleusercontent.com' +
      '&scope=openid%20email%20profile' +
      '&response_type=id_token' +
      '&gsiwebsdk=gis_attributes' +
      '&redirect_uri=http%3A%2F%2Flocalhost%3A4200' +  // This should be your app's URL
      '&response_mode=form_post' +
      '&origin=http%3A%2F%2Flocalhost%3A4200' +
      '&display=popup' +
      '&prompt=select_account' +
      '&gis_params=ChVodHRwOi8vbG9jYWxob3N0OjQyMDASFWh0dHA6Ly9sb2NhbGhvc3Q6NDIwMBgHKhZmYUk5NklMOU02aDkxUHJidDJrc29RMkg5MDEwNzA3Njk2ODUtbzA4c3A3b2E5cTkycjFzMWxrOGRyazcxNmM1aTA3Z2IuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb204AUJAZDczYWI1NWQ3MTcwZTcxODlmMWI0NGQxMzNhOGIyNjUzMDY5NjU4NWNmZTc5YmUwMmU4OWNlNjE0MWRlYmE5Yg' +
      '&service=lso&o2v=1&ddm=1&flowName=GeneralOAuthFlow';

    // Redirect the user to the Google OAuth URL
    window.location.href = googleOAuthUrl;
  }
}
