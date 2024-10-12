import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-feedscreen-group-list',
  standalone: true,
  imports: [CommonModule,RouterModule,FormsModule],
  templateUrl: './feedscreen-group-list.component.html',
  styleUrl: './feedscreen-group-list.component.css'
})
export class FeedscreenGroupListComponent implements OnInit {

  APIURL = environment.APIURL;
  populargrouplist:any [] = [];
  userid:string="";
 


  constructor(private http:HttpClient,private router:Router){}

  ngOnInit(): void {
    this.getPopularGroups();
 
      this.userid = localStorage.getItem('wmd') || '';
  
  }


  async getPopularGroups(): Promise<void> {
    this.http.post<any[]>(`${this.APIURL}get_populargroup`, new FormData()).subscribe({
      next: (response: any[]) => {
        this.populargrouplist = response;

        this.populargrouplist.forEach((group:any) => {
          if (group.groupimage) {
            group.groupImageUrl = this.createBlobUrl(group.groupimage, 'image/jpeg');
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


  async navigatetogroup(grouptype:any,groupid:any,groupownerid:any,groupname:string):Promise<void>{
 
    if (grouptype === "public") {
      this.router.navigate(['home/group', groupid]);
    } else if (groupownerid == this.userid) {
      this.router.navigate(['home/group', groupid]);
    } else {



      const formData = new FormData();
      formData.append('groupid', groupid);
      formData.append('groupownerid', groupownerid);
      formData.append('myuserid', this.userid);

      try {
        const response = await this.http.post<any>(`${this.APIURL}ask_permission_from_admin_to_join_group`, formData).toPromise();

        if (response.message === "requestsent") {
          alert("Wait till the permission from " + groupname);
        } else if (response.message === "requestaccepted") {
          this.router.navigate(['home/group', groupid]);
        } else {
          alert(response.message);
        }
      } catch (error) {
        console.error('There was an error!', error);
        alert('There was an error sending the permission request. Please try again later.');
      }

    }
    
  }
}
