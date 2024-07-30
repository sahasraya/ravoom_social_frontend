import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearchComponent } from '../search/search.component';
import { NotificationService } from '../../home/notification/notification.service';
import { NotificationComponent } from '../../home/notification/notification.component';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AddPostComponent } from '../add-post/add-post.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterModule,SearchComponent,NotificationComponent,AddPostComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  APIURL = 'http://127.0.0.1:8000/';
  @Output() addPost = new EventEmitter<void>();
  @Output() uploadPost = new EventEmitter<void>();

  userid: string = "";
  showSignOutMessage: boolean = false;
  openaddpostscreenbool:boolean=false;
  searchText: string = '';
  user: any;
  dropdownVisible: boolean = false;
  private openDropdown: HTMLElement | null = null;
 
  constructor(private notificationService: NotificationService,private http:HttpClient) {}

  ngOnInit(): void {
    this.userid = localStorage.getItem('wmd') || '';
    this.getuserdetails(this.userid);
  }

  openaddpostscreen(): void {
    this.openaddpostscreenbool = true;
    this.addPost.emit();
  }


  showdropdown(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.openDropdown === target) {
      this.closeAllDropdowns();
    } else {
      this.closeAllDropdowns();
      this.dropdownVisible = true;
      this.openDropdown = target;
    }
  }
  onPostAdded(): void {
    this.uploadPost.emit();
  }

  hideDropdown(): void {
    this.dropdownVisible = false;
    this.openDropdown = null;
  }

  async getuserdetails(userid:string):Promise<void>{
    const formData = new FormData();
    formData.append('userid', userid);

    this.http.post<any>(`${this.APIURL}get_user_details`, formData).subscribe({
      next: (response:any) => {
        
        this.user = response;  
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
         
      }
    });
  }
  

  handleSearchText(text: string) {
    this.searchText = text;
  }
  logout(): void {
    localStorage.clear();
    this.showSignOutMessage = true;

    setTimeout(() => {
      this.showSignOutMessage = false;
      location.reload();  
    }, 3000);  
  }

  getNotifications(): void {
    this.notificationService.triggerNotification();
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (this.openDropdown && !this.openDropdown.contains(target)  ) {
      this.closeAllDropdowns();
    }
  }
  closeAllDropdowns(): void {
    this.dropdownVisible = false;
    this.openDropdown = null;
  }
}
