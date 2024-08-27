import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent  {
  APIURL = 'http://127.0.0.1:8000/';

  forgetPassword: FormGroup;
  entercodeForm: FormGroup;
  enternewpasswordForm: FormGroup;

  showinvalidcredentioalsbanner:boolean=false;
  codeissent:boolean=false;
  hidesubmitbutton:boolean=false;
  codeiscorrect:boolean = false;  
  isPasswordFieldFocused: boolean = false;

  message:string="";
  userid:string="";
  forgetpasswordtid:string ="";
  emailaddress:string = "";
 

  countdown: number = 10;
  countdownInterval: any;


  passwordConditions = {
    minLength: false,
    hasNumber: false,
    hasLowercase: false,
    hasUppercase: false,
    hasSpecialChar: false
  };

  correctImage = '../../../assets/images/correct.png';
  wrongImage = '../../../assets/images/wrong.png';

  
  constructor(private fb: FormBuilder,private http:HttpClient,private router:Router){
    this.forgetPassword = this.fb.group({
      emailaddress: ['', [Validators.required, Validators.email]],
 
     
  
    });


    this.entercodeForm = this.fb.group({
      code: ['', [Validators.required]],
 
     
  
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

    
    routetologinscreen():void{
      this.router.navigate(['auth/log-in']);
    }


  async onSubmitForgetpassword(): Promise<void> {
    const formData = new FormData();
   
    formData.append('emailaddress', this.forgetPassword.get('emailaddress')!.value);
 
    
    this.http.post(this.APIURL + 'check-email-address-exist', formData).subscribe({
      next: (response: any) => {
       
         if(response.message =="noemail"){
          this.showinvalidcredentioalsbanner= true;
          this.message = "No email found";

          setTimeout(() => {
            this.showinvalidcredentioalsbanner = false;
          }, 3000);
    
         }
         if(response.message=="Code sent successfully"){
          this.showinvalidcredentioalsbanner= false;
          this.forgetpasswordtid=response.forgetpasswordtid;
          this.startCountdown();
          this.codeissent=true;
          this.hidesubmitbutton=true;
          this.userid=response.userid;
          this.emailaddress = response.emailaddress;




      
            

         }
      
      },
      error: error => {
        console.error('There was an error posting the data!', error);
      }
    });
  }



  async onSubmitCode():Promise<void>{

        const formData = new FormData();
        formData.append('userid', this.userid);
        formData.append('forgetpasswordtid', this.forgetpasswordtid);
        formData.append('code', this.entercodeForm.get('code')!.value);


      

   
   
  
        this.http.post(this.APIURL + 'check-code-submit-forget-password', formData).subscribe({
          next: (response: any) => {
        
            if(response.message == "notmatched"){

              this.showinvalidcredentioalsbanner= true;
              this.message="Code is incorrect";
              setTimeout(() => {
                this.showinvalidcredentioalsbanner = false;
              }, 3000);

            }else if(response.message=="matched"){
              this.codeiscorrect=true;
              this.codeissent=false;
              if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
              }
            }
          },
          error: error => {
            console.error('There was an error posting the data!', error);
          }
        });

  }



  async resendCode():Promise<void> {
 
 
    this.startCountdown();
    this.showinvalidcredentioalsbanner=false;
    this.codeissent = true;
    this.onSubmitForgetpassword();
 
  
  
  
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
        formData.append('forgetpasswordtid', this.forgetpasswordtid);

   
   
  
        this.http.post(this.APIURL + 'expire-forget-password', formData).subscribe({
          next: (response: any) => {
            console.log('Password reset code expired');
            this.entercodeForm.reset();
          },
          error: error => {
            console.error('There was an error posting the data!', error);
          }
        });
      }
    }, 1000);
  }


  async onSubmitnewpassword():Promise<void>{
    const formData = new FormData();
    formData.append('userid', this.userid);
    formData.append('newpassword', this.enternewpasswordForm.get('newpassword')!.value);
    formData.append('useremailaddress', this.emailaddress);
    formData.append('reenternewpassword', this.enternewpasswordForm.get('reenternewpassword')!.value);


  
  
    if (this.enternewpasswordForm.get('newpassword')!.value !== this.enternewpasswordForm.get('reenternewpassword')!.value) {
      this.showinvalidcredentioalsbanner = true;
      this.message = "Passwords do not match";
      return;
    }
  
    this.showinvalidcredentioalsbanner = false;
 


  
    this.http.post(this.APIURL + 'update-forget-new-password', formData).subscribe({
      next: (response: any) => {
        console.log('Password updated successfully');
        alert("Password updated successfully");
         this.enternewpasswordForm.reset();
         this.forgetPassword.reset();
          this.codeiscorrect=false;
         this.isPasswordFieldFocused=false;
         this.hidesubmitbutton=true;

     
      },
      error: error => {
     
        console.error('There was an error posting the data!', error);
      }
    });
    
  }
}
