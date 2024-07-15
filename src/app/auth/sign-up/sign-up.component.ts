import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit{
  signUpForm: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  APIURL = 'http://127.0.0.1:8000/';
  maxDate: string="";
  age: number | null = null;
  passwordsnotmatching:boolean = false;
  showPassword: boolean = false;
  bannerClass: string = '';


  errormessage:string = "";

  constructor(private fb: FormBuilder, private http: HttpClient,private router:Router) {
    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      emailaddress: ['', [Validators.required, Validators.email]],
      phonenumber: ['', Validators.required],
      password: ['', Validators.required],
      reenterpassword: ['', Validators.required],
      birthdate: ['', Validators.required],
      profileimage: ['', Validators.required]
  
    });
  }
  ngOnInit(): void {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = today.getFullYear();
    this.maxDate = `${year}-${month}-${day}`;

    this.signUpForm.get('birthdate')?.valueChanges.subscribe(value => {
      if (value) {
        this.calculateAge(value);
      }
    });

  }


  calculateAge(birthdate: string): void {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.age = age;
  }


  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.signUpForm.patchValue({ profileimage: file });
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.signUpForm.valid) {
      const formData = new FormData();

      if (this.age !== null) {
        formData.append('age', this.age.toString());
      }
      
      Object.keys(this.signUpForm.value).forEach(key => {
        formData.append(key, this.signUpForm.value[key]);
        console.log(this.signUpForm.value[key]);
      });

      this.http.post(this.APIURL + 'sign-up', formData).subscribe({
        next: (response:any) => {
          
           if(response.message =="Passwords do not match"){
              this.passwordsnotmatching=true;
              this.errormessage = response.message;
              this.bannerClass = 'error-banner';

              setTimeout(() => {
                this.passwordsnotmatching = false;
              }, 3000);

           }else if(response.message=="Email address already exists"){
            this.passwordsnotmatching=true;
            this.errormessage = response.message;
            this.bannerClass = 'error-banner';

            setTimeout(() => {
              this.passwordsnotmatching = false;
            }, 3000);
            
            } else if(response.message=="User created successfully"){
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
            localStorage.setItem('ger', response.userid);
            localStorage.setItem('fat', response.userid);
            localStorage.setItem('mainsource', response.userid);
            localStorage.setItem('ud', response.userid);
            localStorage.setItem('www', '34');
            localStorage.setItem('reload', 'false');

            this.signUpForm.reset();

            this.passwordsnotmatching=true;
            this.bannerClass = 'good-banner';
            this.errormessage ="Confirm the Email and Log in";
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
