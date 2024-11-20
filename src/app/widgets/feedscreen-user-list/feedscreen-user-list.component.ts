import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { useridexported } from '../../auth/const/const';
import { SkeletonWidgetPopularGroupsAndUsersComponent } from '../skeleton-widget-popular-groups-and-users/skeleton-widget-popular-groups-and-users.component';

@Component({
  selector: 'app-feedscreen-user-list',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule,SkeletonWidgetPopularGroupsAndUsersComponent],
  templateUrl: './feedscreen-user-list.component.html',
  styleUrl: './feedscreen-user-list.component.css'
})
export class FeedscreenUserListComponent implements OnInit {


  APIURL = environment.APIURL;
  @Output() optionSelected: EventEmitter<string> = new EventEmitter<string>();
  @Output() feedMethodCalled: EventEmitter<string> = new EventEmitter<string>();
  userList: any[] =[];
  userid: string = "";
  screen: string = "";
  isloadinguserlist: boolean = false;
 
  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {


    this.userid =useridexported;
    if (this.userid != '') {

      this.getUserList();

    } else { 
      this.userList = [];
 
    }

  }


  async getUserList(): Promise<void> {
    if (this.isloadinguserlist) return;

    this.isloadinguserlist = true;

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
        this.isloadinguserlist = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isloadinguserlist = false;
        console.error('There was an error!', error);
      }
    });
  }
 


  navigatetouser(userid: any): void {


    document.body.style.overflow = ''; 
    this.router.navigate([`/home/profile/${userid}`]);
  }




 

  commentOnPost(event: MouseEvent, postid: any, n_or_g: any): void {
    event.preventDefault();

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    localStorage.setItem('scrollPosition', scrollPosition.toString());


    this.screen = "home";
    this.router.navigate([`/home/comment/${postid}/${n_or_g}/${this.screen}/`]);
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





  showtexts(e: Event): void {
    document.body.style.overflow = ''; 
    e.preventDefault();
    e.stopPropagation();
    this.optionSelected.emit('text');  

   
    if (window.innerWidth < 500) {
      this.callFeedMethod('text');
    }
  }

  showvideos(e: Event): void {
    document.body.style.overflow = ''; 
    e.preventDefault();
    e.stopPropagation();
    this.optionSelected.emit('video');   

    if (window.innerWidth < 500) {
      this.callFeedMethod('video'); 
    }
  }

  showlinks(e: Event): void {
    document.body.style.overflow = ''; 
    e.preventDefault();
    e.stopPropagation();
    this.optionSelected.emit('link');  

    if (window.innerWidth < 500) {
      this.callFeedMethod('link'); 
    }
  }

  showimages(e: Event): void {
    document.body.style.overflow = ''; 
    e.preventDefault();
    e.stopPropagation();
    this.optionSelected.emit('image');  

    if (window.innerWidth < 500) {
      this.callFeedMethod('image'); 
    }
  }

  showvoices(e: Event): void {
    document.body.style.overflow = ''; 
    e.preventDefault();
    e.stopPropagation();
    this.optionSelected.emit('audio');  

    if (window.innerWidth < 500) {
      this.callFeedMethod('audio'); 
    }
  }


  private callFeedMethod(selectedOption: string): void {
    this.feedMethodCalled.emit(selectedOption);   
  }












}
