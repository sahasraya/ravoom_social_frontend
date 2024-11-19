import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { useridexported } from '../../auth/const/const';

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

  APIURL = environment.APIURL;
  userid: string = "";
  groupmessageexsisteornot:string ="";
  groupmessageColor:string="white";
  isgroupiscreating:boolean=false;

  constructor(private fb :FormBuilder,private http:HttpClient,@Inject(PLATFORM_ID) private platformId: Object,private router:Router){

    this.createGroupFormGroup = this.fb.group({
      groupimage:['',Validators.required],
      groupbackgroundimage:['',Validators.required],
      groupname:['',Validators.required],
      grouptype: ['', Validators.required]
    });

    

  }
  ngOnInit(): void {
   
 
      this.userid = useridexported;
 
    
  }



  async onSubmitGroupInformation(): Promise<void> {
    if (this.createGroupFormGroup.valid) {
       this.isgroupiscreating = true;

      const token = localStorage.getItem('jwt');
      if(!token){
        alert("Unauthorized access. Please check your credentials.");
       this.isgroupiscreating = false;
        return;
      }
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
  


      const formData = new FormData();
  
      formData.append('userid', this.userid.toString());
      formData.append('grouptype', this.createGroupFormGroup.get('grouptype')?.value);
      formData.append('groupname', this.createGroupFormGroup.get('groupname')?.value);
      formData.append('groupimage', this.createGroupFormGroup.get('groupimage')?.value);
      formData.append('groupbackgroundimage', this.createGroupFormGroup.get('groupbackgroundimage')?.value);
  
      this.http.post(this.APIURL + 'create-group', formData,{headers}).subscribe({
        next: (response: any) => {
          this.isgroupiscreating = false;
        
          this.createGroupFormGroup.reset();
          this.router.navigate(['home/group', response['groupid']]);
        },
        error: (error: any) => {
         this.isgroupiscreating = false;

          if (error.status === 401) {
          alert("Unauthorized access. Please check your credentials");
           
  
          }
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
