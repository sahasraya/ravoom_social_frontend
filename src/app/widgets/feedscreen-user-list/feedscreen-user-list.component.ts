import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-feedscreen-user-list',
  standalone: true,
  imports: [RouterModule,CommonModule,FormsModule],
  templateUrl: './feedscreen-user-list.component.html',
  styleUrl: './feedscreen-user-list.component.css'
})
export class FeedscreenUserListComponent  implements OnInit{


  APIURL = 'http://127.0.0.1:8000/';
  userList:any;
  userid:string="";
  userSearchText:string="";


  constructor(private http:HttpClient,private router:Router){}

  ngOnInit(): void {

 
      this.userid = localStorage.getItem('wmd') || '';
      if(this.userid !=''){
      
        this.getUserList();
      }else{
   

        this.userList=[];
      }
  
  }

  navigatetolisttofollowuserscreen():void{
    this.router.navigate(['/home/userlist-to-follow'])
  }

  navigatetouser(userid:any):void{
 
   

 this.router.navigate([`/home/profile/${userid}`]);
  }

  async getUserList(): Promise<void> {
    const formData = new FormData();
    formData.append('currentuserid', this.userid);
 

    this.http.post<any>(`${this.APIURL}get_userlist`, formData).subscribe({
      next: (response: any[]) => {
        this.userList = response;

 
        this.userList.forEach((user: any) => {
          if (user.profileimage) {
            user.profileimageUrl = this.createBlobUrl(user.profileimage, 'image/jpeg');
          }
        });
        console.log(this.userList);  // Log the user details
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
      }
    });
  }





  async filterTheusers(): Promise<void> {
    const formData = new FormData();
    formData.append('query', this.userSearchText);
  
    this.http.post<any>(`${this.APIURL}search-user-result`, formData).subscribe({
      next: (response: any) => {
        this.userList = response.users;
        console.log(this.userList);
  
        this.userList.forEach((user:any) => {
          if (user.profileimage) {
            user.profileimageUrl = this.createBlobUrl(user.profileimage, 'image/jpeg');
          }
        });
  
        
       
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
      }
    });
  }



  base64ToBlob(base64: string, contentType: string = ''): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
  }
  
  createBlobUrl(base64: string, contentType: string): string {
    const blob = this.base64ToBlob(base64, contentType);
    return URL.createObjectURL(blob);
  }


  


  
}
