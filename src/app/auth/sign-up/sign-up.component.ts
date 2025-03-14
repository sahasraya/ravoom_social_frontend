import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PreLoaderComponent } from '../../widgets/pre-loader/pre-loader.component';
import { environment } from '../../../environments/environment';
import { NetworkService } from '../../services/network.service';
import { UserIdEncryptionService } from '../../services/user-id-encryption.service';
import { GoogleAuthComponent } from '../google-auth/google-auth.component';
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PreLoaderComponent,
    GoogleAuthComponent
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit{
  @ViewChild('emailInput') emailInput!: ElementRef; 
  @ViewChild('password')passwordInput!: ElementRef; 


  
  signUpForm: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  APIURL = environment.APIURL;
  maxDate: string="";
  age: number | null = null;
  passwordsnotmatching:boolean = false;
  showPassword: boolean = false;
  bannerClass: string = '';


  errormessage:string = "";
  isPasswordFieldFocused: boolean = false;
  issigninup:boolean=false;
  isPrivacyPolicyChecked: boolean = false; 

  correctImage = '../../../assets/images/correct.png';
  wrongImage = '../../../assets/images/wrong.png';

  passwordConditions = {
    minLength: false,
    hasNumber: false,
    hasLowercase: false,
    hasUppercase: false,
    hasSpecialChar: false
  };


  constructor(private fb: FormBuilder, private http: HttpClient,private router:Router) {
    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      emailaddress: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      reenterpassword: ['', Validators.required],
      birthdate: ['', Validators.required],
      // profileimage: ['', Validators.required]
  
    });
  }
  ngOnInit(): void {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');  
    const year = today.getFullYear();
    this.maxDate = `${year}-${month}-${day}`;

    this.signUpForm.get('birthdate')?.valueChanges.subscribe(value => {
      if (value) {
        this.calculateAge(value);
      }
    });

    this.signUpForm.get('password')?.valueChanges.subscribe(() => {
      this.isPasswordFieldFocused = true;
      this.checkPasswordStrength();
    });

    this.checkTheLocalStorageValues();

    


  }
  onPrivacyPolicyCheckboxClick() {
    this.isPrivacyPolicyChecked = !this.isPrivacyPolicyChecked;
  }

 togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
allPasswordConditionsMet(): boolean {
  const allConditionsMet = Object.values(this.passwordConditions).every(condition => condition);

  if (!allConditionsMet) {
    this.signUpForm.get('reenterpassword')?.setValue('');
  }

  return allConditionsMet;
}
  
  checkPasswordStrength() {
    const password = this.signUpForm.get('password')?.value;
    this.passwordConditions.minLength = password.length >= 8;
    this.passwordConditions.hasNumber = /\d/.test(password);
    this.passwordConditions.hasLowercase = /[a-z]/.test(password);
    this.passwordConditions.hasUppercase = /[A-Z]/.test(password);
    this.passwordConditions.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
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
      this.issigninup = true;
      this.passwordsnotmatching = true;
      this.bannerClass = 'hidden-banner';

      const formData = new FormData();
  
      if (this.age !== null) {
        formData.append('age', this.age.toString());
      }
      if(this.signUpForm.get("password")!.value != this.signUpForm.get("reenterpassword")!.value){
              this.issigninup = false;

              this.bannerClass = 'error-banner';
              this.errormessage = "Passwords do not match";
              this.passwordInput.nativeElement.focus();
              setTimeout(() => {
                this.passwordsnotmatching = false;
              }, 3000);
              return;
      }
  
      const profileImage = this.signUpForm.get('profileimage')?.value;
  
      const submitFormData = () => {
        Object.keys(this.signUpForm.value).forEach(key => {
          if (key !== 'profileimage') {  
            formData.append(key, this.signUpForm.value[key]);
          }
        });
  
        this.http.post(this.APIURL + 'sign-up', formData).subscribe({
          next: (response: any) => {
            this.issigninup = false;
            this.passwordsnotmatching = false;

  
             if (response.message === "User created successfully") {
              this.handleSuccess(response.userid);
            }
          },
          error: error => {
            this.issigninup = false;
            if(error.message="Email address already exists"){
              this.bannerClass = 'error-banner';
              this.errormessage = "Email address already exists";
              this.emailInput.nativeElement.focus();
              setTimeout(() => {
                this.passwordsnotmatching = false;
              }, 3000);
              return;

            }
           
            console.error('There was an error!', error);
          }
        });
      };
  
      if (!profileImage) {
        this.loadDefaultImage().then((defaultImageBlob) => {
          formData.append('profileimage', defaultImageBlob, 'default-profileimage.png');
          submitFormData();  
        }).catch(error => {
          this.issigninup = false;
          console.error('Error loading default image:', error);
        });
      } else {
        formData.append('profileimage', profileImage);
        submitFormData();
      }
    }
  }
  



  private handleSuccess(userId: string): void {
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
  
    localStorage.setItem('wmd', userId);
    localStorage.setItem('ger', '30491aDdwqf');
    localStorage.setItem('fat', 'new set');
    localStorage.setItem('mainsource', 'web');
    localStorage.setItem('ud', 'no');
    localStorage.setItem('www', '34');
    localStorage.setItem('reload', 'false');
  
    localStorage.removeItem('username');
    localStorage.removeItem('emailaddress');
    localStorage.removeItem('phonenumber');
    localStorage.setItem('signupwithgmail', 'false');
   

    this.signUpForm.reset();
    this.isPasswordFieldFocused = false;
    this.signUpForm.patchValue({ profileimage: null });
    this.imagePreview = null;
  
    this.passwordsnotmatching = true;
    this.bannerClass = 'good-banner';
    this.errormessage = "Confirm the Email and Log in";
  }
  
  
  private loadDefaultImage(): Promise<Blob> {
    return fetch('../../../assets/images/profile-user.png')  
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.blob();  
      })
      .catch(error => {
        console.error('Error loading default image:', error);
        throw error;  
      });
  }
  
  visiblepassword(): void {
    this.showPassword = !this.showPassword;
  }

  checkpasswordequls(password:string , reenterpassword:string):void{

    if(password == reenterpassword){
      this.isPasswordFieldFocused = false;
    }else{
      this.isPasswordFieldFocused = true;

    }
  }

  resetform(e: Event): void {
    e.preventDefault(); 
    localStorage.clear();
    this.signUpForm.reset();  
    this.isPasswordFieldFocused = false;
     this.signUpForm.patchValue({
    username: '',
    emailaddress: '',
    phonenumber: '',
    birthdate: '',
    profileimage: null  
  });
    this.signUpForm.patchValue({ profileimage: null });
    this.imagePreview = null;
  }

  checkTheLocalStorageValues(): void {
    this.signUpForm.get('username')?.setValue(localStorage.getItem('username') || '');
    this.signUpForm.get('emailaddress')?.setValue(localStorage.getItem('emailaddress') || '');
    this.signUpForm.get('phonenumber')?.setValue(localStorage.getItem('phonenumber') || '');
  }
  
  goToSignUpScreen(): void {
 
    if (
      this.signUpForm.get('username')?.value != ""   ||  this.signUpForm.get('emailaddress')?.value != "" || this.signUpForm.get('phonenumber')?.value != ""
    ) {
      const result = confirm("Do you need to navigate?");
      if (result) {
        localStorage.setItem('username', this.signUpForm.get('username')?.value);
        localStorage.setItem('emailaddress', this.signUpForm.get('emailaddress')?.value);
        localStorage.setItem('phonenumber', this.signUpForm.get('phonenumber')?.value);
  
        this.router.navigate(['/auth/log-in']);
      }

    } else {
      this.router.navigate(['/auth/log-in']);
      
    }
  }
}
