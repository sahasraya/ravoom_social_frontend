import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { UserIdEncryptionService } from '../../services/user-id-encryption.service';
import { GoogleAuthComponent } from '../google-auth/google-auth.component';
import { GoogleAuthLogInComponent } from '../google-auth-log-in/google-auth-log-in.component';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    GoogleAuthLogInComponent
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent implements OnInit {

  loginForm: FormGroup;
  showinvalidcredentioalsbanner:boolean = false;
  showPassword: boolean = false;
  loginmessage:string = "";
  showPasswordToggle: boolean = false;

  APIURL = environment.APIURL;


  
  constructor(private fb: FormBuilder,private http:HttpClient,private router:Router,private userIdEncryptionService: UserIdEncryptionService){
    this.loginForm = this.fb.group({
      emailaddress: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
     
  
    });

    
  }
  ngOnInit(): void {
    this.loginForm.get('password')!.valueChanges.subscribe(value => {
      this.showPasswordToggle = value.length > 0;
    });
  }



  
  onSubmit(): void {
    if (this.loginForm.valid) {
      const formData = new FormData();
      Object.keys(this.loginForm.value).forEach(key => {
        formData.append(key, this.loginForm.value[key]);
      });
  
      this.http.post(this.APIURL + 'log-in', formData).subscribe({
        next: (response: any) => {
       
          if (response.message === "Login successful") {
           
            localStorage.setItem('ppd', 'no');
            localStorage.setItem('jwt', response.token);
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
            

            this.router.navigate(['']).then(() => {
              location.reload();
            });
        
          }else if (response.message=="Please confirm the email"){
            this.loginmessage= "Please confirm the email";

            this.showinvalidcredentioalsbanner = true;
              setTimeout(() => {
                this.showinvalidcredentioalsbanner = false;
              }, 3000);

          } else if(response.message =="No user found"){

              this.loginmessage= "Invalid credentials";
              this.showinvalidcredentioalsbanner = true;
              setTimeout(() => {
                this.showinvalidcredentioalsbanner = false;
              }, 3000);
          }else {
            console.error('Login failed:', response.message);
          }
        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    }
  }

  visiblepassword(): void {
    this.showPassword = !this.showPassword;
  }

}
