// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
// import { CommonModule } from '@angular/common';
// import { RouterModule, RouterOutlet } from '@angular/router';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { GoogleLoginProvider, SocialAuthService, SocialAuthServiceConfig, SocialLoginModule, SocialUser } from '@abacritt/angularx-social-login';
// @Component({
//   selector: 'app-sign-up',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterOutlet,
//     HttpClientModule,
//     FormsModule,
//     ReactiveFormsModule,
//     RouterModule,
//     SocialLoginModule
//   ],
//   providers: [
//     {
//       provide: 'SocialAuthServiceConfig',
//       useValue: {
//         autoLogin: false,
//         providers: [
//           {
//             id: GoogleLoginProvider.PROVIDER_ID,
//             provider: new GoogleLoginProvider('your_google_client_id_here')
//           }
//           // You can add more providers if needed
//         ]
//       } as SocialAuthServiceConfig
//     }
//   ],

//   templateUrl: './sign-up.component.html',
//   styleUrls: ['./sign-up.component.css']
// })
// export class SignUpComponent {
//   signUpForm: FormGroup;
//   imagePreview: string | ArrayBuffer | null = null;
//   APIURL = 'http://127.0.0.1:8000/';

//   constructor(private fb: FormBuilder, private http: HttpClient, private authService: SocialAuthService) {
//     this.signUpForm = this.fb.group({
//       username: ['', Validators.required],
//       emailaddress: ['', [Validators.required, Validators.email]],
//       phonenumber: ['', Validators.required],
//       password: ['', Validators.required],
//       reenterpassword: ['', Validators.required],
//       profileimage: [null]
  
//     });
//   }

//   onFileSelected(event: any): void {
//     const file = event.target.files[0];
//     if (file) {
//       this.signUpForm.patchValue({ profileimage: file });
//       const reader = new FileReader();
//       reader.onload = () => {
//         this.imagePreview = reader.result;
//       };
//       reader.readAsDataURL(file);
//     }
//   }

//   onSubmit(): void {
//     if (this.signUpForm.valid) {
//       const formData = new FormData();
//       Object.keys(this.signUpForm.value).forEach(key => {
//         formData.append(key, this.signUpForm.value[key]);
//       });

//       this.http.post(this.APIURL + 'sign-up', formData).subscribe({
//         next: response => {
//           console.log(response);
//           // Handle the response here
//         },
//         error: error => {
//           console.error('There was an error!', error);
//         }
//       });
//     }
//   }



//   signInWithGoogle(): void {
//     this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user: SocialUser) => {
//       console.log(user);
//       // You can handle the user data here, like sending it to your backend for authentication
//     }).catch(error => {
//       console.error('Error occurred while signing in with Google:', error);
//     });
//   }
  
// }
