import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './create-group.component.html',
  styleUrl: './create-group.component.css'
})
export class CreateGroupComponent implements OnInit{

  createGroupFormGroup:FormGroup;
  imagePreviewGroupImage: string | ArrayBuffer | null = null;
  imagePreviewGroupBackgroundImage: string | ArrayBuffer | null = null;

  APIURL = 'http://127.0.0.1:8000/';
  userid: string = "";
  groupmessageexsisteornot:string ="";
  groupmessageColor:string="white";

  constructor(private fb :FormBuilder,private http:HttpClient,@Inject(PLATFORM_ID) private platformId: Object,private router:Router){

    this.createGroupFormGroup = this.fb.group({
      groupimage:['',Validators.required],
      groupbackgroundimage:['',Validators.required],
      groupname:['',Validators.required],
      grouptype: ['', Validators.required]
    });

    

  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
 
      this.userid = localStorage.getItem('wmd') || '';
 
    }
  }



  async onSubmitGroupInformation(): Promise<void> {
    if (this.createGroupFormGroup.valid) {
      const formData = new FormData();
  
      formData.append('userid', this.userid.toString());
      formData.append('grouptype', this.createGroupFormGroup.get('grouptype')?.value);
      formData.append('groupname', this.createGroupFormGroup.get('groupname')?.value);
      formData.append('groupimage', this.createGroupFormGroup.get('groupimage')?.value);
      formData.append('groupbackgroundimage', this.createGroupFormGroup.get('groupbackgroundimage')?.value);
  
      this.http.post(this.APIURL + 'create-group', formData).subscribe({
        next: (response: any) => {
        
          this.createGroupFormGroup.reset();
          this.router.navigate(['home/group', response['groupid']]);
        },
        error: (error: any) => {
          console.error('There was an error!', error);
        }
      });
    }
  }





 

  ongroupimageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
    
        this.imagePreviewGroupImage = reader.result;
  
 
        this.createGroupFormGroup.patchValue({
          groupimage: file
        });
      };
      reader.readAsDataURL(file);  
    }
  }


  ongroupbackgroundimageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
    
        this.imagePreviewGroupBackgroundImage = reader.result;
  
 
        this.createGroupFormGroup.patchValue({
          groupbackgroundimage: file
        });
      };
      reader.readAsDataURL(file);  
    }
  }



 
  async checkgroupnamealreadytaken(groupname: string): Promise<void> {
    if(groupname ===''){
      this.groupmessageexsisteornot="";
      return;
    }
    const formData = new FormData();
    formData.append('groupname', groupname);
  
    this.http.post(this.APIURL + 'check_groupname_exsist_or_not_group', formData).subscribe({
      next: (response: any) => {
        if(response.message === "yes") {
          this.groupmessageexsisteornot = "name is taken";
          this.groupmessageColor = 'red';
        } else {
           this.groupmessageexsisteornot="good to use";
           this.groupmessageColor = 'green';
        }
      },
      error: (error: any) => {
        console.error('There was an error!', error);
      }
    });
  }


}
