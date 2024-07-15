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
  profileImageUrl: string = ''; // Variable for the profile image Blob URL
  APIURL = 'http://127.0.0.1:8000/';
 
  user: any;

  constructor(private fb: FormBuilder, private http: HttpClient, private route: ActivatedRoute) {
    this.updateForm = this.fb.group({
      username: ['', Validators.required],
      emailaddress: ['', [Validators.required, Validators.email]],
      phonenumber: ['', Validators.required],
      password: ['', Validators.required],
      reenterpassword: ['', Validators.required],
      profileimage: [null]
    });
  }

  ngOnInit(): void {
    this.userid = this.route.snapshot.paramMap.get('uid');
    this.getUserDetails();
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
        next: response => {
          console.log(response);
          // Optionally handle success response
        },
        error: error => {
          console.error('There was an error!', error);
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
        console.log(this.user);
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
         
      }
    });
  }

 

  
}
