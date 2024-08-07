import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit{

  resetPassWordForm: FormGroup;
  entersentcode: FormGroup;
  enternewpasswordForm: FormGroup;

  showinvalidcredentioalsbanner:boolean= false;
  codeissent:boolean=false;
  showpasswordresetoptions:boolean =false;
  isPasswordFieldFocused: boolean = false;

  userid:string = "";
  message:string="";
  useremailaddress:string = "";
  code:string="";
  passwordresetid:string="";

  countdown: number = 10;
  countdownInterval: any;

  APIURL = 'http://127.0.0.1:8000/';

  passwordConditions = {
    minLength: false,
    hasNumber: false,
    hasLowercase: false,
    hasUppercase: false,
    hasSpecialChar: false
  };

  correctImage = '../../../assets/images/correct.png';
  wrongImage = '../../../assets/images/wrong.png';


  constructor(private fb: FormBuilder,private http:HttpClient){
    this.resetPassWordForm = this.fb.group({
      curruntpassword: ['', Validators.required],
 
    });

    this.entersentcode = this.fb.group({
      sentcode: ['', Validators.required],
 
    });


    this.enternewpasswordForm = this.fb.group({
      newpassword: ['', Validators.required],
      reenternewpassword: ['', Validators.required],
 
    });

    this.enternewpasswordForm.get('newpassword')?.valueChanges.subscribe(() => {
      this.isPasswordFieldFocused = true;
      this.checkPasswordStrength();
    });

  }
  ngOnInit(): void {
    this.userid = localStorage.getItem('wmd') || '';
  }


  async onSubmitResetpassword(): Promise<void> {
    const formData = new FormData();
    formData.append('userid', this.userid);
    formData.append('curruntpassword', this.resetPassWordForm.get('curruntpassword')!.value);

    this.http.post(this.APIURL + 'check-password-for-reset', formData).subscribe({
        next: (response: any) => {
            if (response.message === "matched") {
              this.showinvalidcredentioalsbanner = false;

                 this.useremailaddress= response.emailaddress;
                 this.codeissent=true;
                 this.startCountdown();
                 this.code=response.code;
                 this.passwordresetid= response.passwordresetid;

              
            } 
            
            else if (response.message === "notmatched") {
                this.showinvalidcredentioalsbanner = true;
                this.message = "Password not matched";
                setTimeout(() => {
                  this.showinvalidcredentioalsbanner = false;
                }, 3000);

            } 
            
            else if (response.message === "User not found") {
                    this.showinvalidcredentioalsbanner = true;
                    this.message = "User not found";
                    setTimeout(() => {
                      this.showinvalidcredentioalsbanner = false;
                    }, 3000);
            }


        },
        error: error => {
            console.error('There was an error posting the data!', error);
        }
    });
}



startCountdown() {
  this.countdown = 60;
  if (this.countdownInterval) {
    clearInterval(this.countdownInterval);
  }
  this.countdownInterval = setInterval(() => {
    if (this.countdown > 0) {
      this.countdown--;
    } else {
      clearInterval(this.countdownInterval);
      this.codeissent = false;
      this.showinvalidcredentioalsbanner = true;
                    this.message = "Code is expired. Resend the code.";
                    setTimeout(() => {
                      this.showinvalidcredentioalsbanner = false;
                    }, 3000);

      const formData = new FormData();
      formData.append('userid', this.userid);
      formData.append('passwordresetid', this.passwordresetid);

      this.http.post(this.APIURL + 'expire-password', formData).subscribe({
        next: (response: any) => {
          console.log('Password reset code expired');
        },
        error: error => {
          console.error('There was an error posting the data!', error);
        }
      });
    }
  }, 1000);
}

async resendCode():Promise<void> {
 
 
  this.startCountdown();
  this.showinvalidcredentioalsbanner=false;
  this.onSubmitResetpassword();



}

async onSubmitsentcode(): Promise<void> {
  const formData = new FormData();
  formData.append('userid', this.userid);
  formData.append('passwordresetid', this.passwordresetid);
  formData.append('code', this.entersentcode.get('sentcode')!.value);
 

  this.http.post(this.APIURL + 'code-check', formData).subscribe({
    next: (response: any) => {
      if (response.message === "matched") {
        clearInterval(this.countdownInterval);
        this.codeissent = false;
        this.showinvalidcredentioalsbanner = false;
        this.showpasswordresetoptions=true;

      } else if (response.message === "expired") {
        this.showinvalidcredentioalsbanner = true;
        this.message = "Code is expired. Resend the code.";
        this.showpasswordresetoptions=false;

        setTimeout(() => {
          this.showinvalidcredentioalsbanner = false;
        }, 3000);
      } else if (response.message === "notmatched") {
        this.showinvalidcredentioalsbanner = true;
        this.message = "Code not matched. Please check the code.";
        this.showpasswordresetoptions=false;

        setTimeout(() => {
          this.showinvalidcredentioalsbanner = false;
        }, 3000);
      } else if (response.message === "Code not found") {
        this.showinvalidcredentioalsbanner = true;
        this.message = "Code not found. Please check the code.";
        this.showpasswordresetoptions=false;

        setTimeout(() => {
          this.showinvalidcredentioalsbanner = false;
        }, 3000);
      }
    },
    error: error => {
      this.showpasswordresetoptions=false;
      console.error('There was an error posting the data!', error);
    }
  });
}




allPasswordConditionsMet(): boolean {
  const allConditionsMet = Object.values(this.passwordConditions).every(condition => condition);

  if (!allConditionsMet) {
    this.enternewpasswordForm.get('reenternewpassword')?.setValue('');
  }

  return allConditionsMet;
}
  checkPasswordStrength() {
    const password = this.enternewpasswordForm.get('newpassword')?.value;
 
    this.passwordConditions.minLength = password.length >= 8;
    this.passwordConditions.hasNumber = /\d/.test(password);
    this.passwordConditions.hasLowercase = /[a-z]/.test(password);
    this.passwordConditions.hasUppercase = /[A-Z]/.test(password);
    this.passwordConditions.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }





  async onSubmitnewpassword(): Promise<void> {
    const formData = new FormData();
    formData.append('userid', this.userid);
    formData.append('newpassword', this.enternewpasswordForm.get('newpassword')!.value);
    formData.append('useremailaddress', this.useremailaddress);
    formData.append('reenternewpassword', this.enternewpasswordForm.get('reenternewpassword')!.value);


  
  
    if (this.enternewpasswordForm.get('newpassword')!.value !== this.enternewpasswordForm.get('reenternewpassword')!.value) {
      this.showinvalidcredentioalsbanner = true;
      this.message = "Passwords do not match";
      return;
    }
  
    this.showinvalidcredentioalsbanner = false;
 


  
    this.http.post(this.APIURL + 'update-new-password', formData).subscribe({
      next: (response: any) => {
        console.log('Password updated successfully');
        alert("Password updated successfully");
         this.enternewpasswordForm.reset();
         this.resetPassWordForm.reset();
         this.entersentcode.reset();
         this.isPasswordFieldFocused=false;
         this.showpasswordresetoptions=false;
      },
      error: error => {
        this.showpasswordresetoptions = false;
        console.error('There was an error posting the data!', error);
      }
    });
  }
  
 

 
}
