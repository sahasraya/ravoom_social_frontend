import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-userlist-to-follow',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './userlist-to-follow.component.html',
  styleUrl: './userlist-to-follow.component.css'
})
export class UserlistToFollowComponent  implements OnInit{
 
  APIURL = environment.APIURL;
  currentUserId:string ="";
  users:any;
  profileimageUrl:any;
  followButtonText: string = 'Follow';

  constructor(private http:HttpClient){}

  ngOnInit(): void {

    this.currentUserId = localStorage.getItem('wmd') || '';
    this.getuserlisttofollow( );
  }


  async getuserlisttofollow(): Promise<void> {
    const formData = new FormData();
    formData.append('currentUserId', this.currentUserId);

    this.http.post<any>(`${this.APIURL}get_userlist_to_follow`, formData).subscribe({
      next: (response: any) => {
        this.users = response.users.map((user: any) => ({
          ...user,
          followButtonText: 'Follow',  
        }));

        this.users.forEach((user: any) => {
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

  async iamstartedtofollow(iamfollowinguserid: any, index: number): Promise<void> {
    const formData = new FormData();
    formData.append('myuserid', this.currentUserId);
    formData.append('iamfollowinguserid', iamfollowinguserid);

    this.http.post(this.APIURL + 'start-to-follow', formData).subscribe({
      next: (response: any) => {
        this.toggleFollowButtonText(index);
      },
      error: error => {
        console.error('There was an error!', error);
      }
    });
  }

  toggleFollowButtonText(index: number): void {
    this.users[index].followButtonText = this.users[index].followButtonText === 'Follow' ? 'Following' : 'Follow';
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
