import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit{

  updateForm: FormGroup;
  userid: any;
  profileImageUrl: string = ''; 
  APIURL = 'http://127.0.0.1:8000/';
  isprofileimageselected:boolean = false;
 
  user: any;
  profileimage: string | ArrayBuffer | null = null;

  isPasswordFieldFocused: boolean = false;
  passwordsaresame:boolean = false;
  showaccountBool:boolean = true;
  showprofileBool:boolean=false;


  correctImage = '../../../assets/images/correct.png';
  wrongImage = '../../../assets/images/wrong.png';


  passwordConditions = {
    minLength: false,
    hasNumber: false,
    hasLowercase: false,
    hasUppercase: false,
    hasSpecialChar: false
  };




  constructor(private fb: FormBuilder, private http: HttpClient, private route: ActivatedRoute) {
    this.updateForm = this.fb.group({
      username: ['', Validators.required],
      emailaddress: ['', [Validators.required, Validators.email]],
      phonenumber: ['', Validators.required],
      profileimage: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userid = this.route.snapshot.paramMap.get('uid');
    this.getUserDetails();

    
 


  }


 

  showaccount():void{
  this.showaccountBool=true;
  this.showprofileBool=false;
  }
  showprofile():void{
   
    this.showaccountBool=false;
    this.showprofileBool=true;
  }

onSubmit(): void {
  if (this.updateForm.valid) {
      const formData = new FormData();
      Object.keys(this.updateForm.controls).forEach(key => {
          const value = this.updateForm.get(key)?.value;
          if (value !== null) {
              formData.append(key, value);
          }
      });

      formData.append('userid', this.userid.toString());

      this.http.post(this.APIURL + 'update-user-details', formData).subscribe({
          next: (response:any) => {
             if(response.message=="User details updated successfully"){
              alert("User details updated successfully");
             }
          },
          error: error => {
              console.error('There was an error!', error);
          }
      });
  }
}




  onProfileImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
 
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileimage = reader.result;
      };
      reader.readAsDataURL(file);
      this.isprofileimageselected= true;

      const formData = new FormData();
      formData.append('userid', this.userid);
      formData.append('profileimage', file);  
  

      this.http.post<any>(`${this.APIURL}update-user-profile`, formData).subscribe({
        next: (response: any) => {
          if (response.message === "done") {
            alert("Profile image updated successfully!");
            this.getUserDetails();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('There was an error posting the data!', error);
        }
      });
    }
  }







  getUserDetails(): void {
   
  const formData = new FormData();
    formData.append('userid', this.userid.toString());

    this.http.post<any>(`${this.APIURL}get_user_details`, formData).subscribe({
      next: response => {
        
        this.user = response;   

   

        this.updateForm.patchValue({
          username: this.user.username,
          emailaddress: this.user.emailaddress,
          phonenumber: this.user.phonenumber,
          password: this.user.password,
          reenterpassword: this.user.password,
          profileimage: this.user.profileimage,
         
        });
        

        
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
         
      }
    });
  }

 

  
}


