import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SearchComponent } from '../search/search.component';
import { NotificationService } from '../../home/notification/notification.service';
import { NotificationComponent } from '../../home/notification/notification.component';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AddPostComponent } from '../add-post/add-post.component';
import { environment } from '../../../environments/environment';
import { FeedscreenUserListComponent } from '../feedscreen-user-list/feedscreen-user-list.component';
import { FeedscreenGroupListComponent } from '../feedscreen-group-list/feedscreen-group-list.component';
import { PrivacyPolicyComponent } from '../../home/privacy-policy/privacy-policy.component';
import { AttributesComponent } from '../../home/attributes/attributes.component';
 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,
    RouterModule,
    SearchComponent,
    NotificationComponent,
    AddPostComponent,
    FeedscreenGroupListComponent,
    FeedscreenUserListComponent,
    PrivacyPolicyComponent,
    AttributesComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  APIURL = environment.APIURL;
  @Output() addPost = new EventEmitter<void>();
  @Output() uploadPost = new EventEmitter<void>();
  @Output() optionSelected: EventEmitter<string> = new EventEmitter<string>();
  @Output() optionSelectedInFeed = new EventEmitter<string>();



  userid: string = "";
  showSignOutMessage: boolean = false;
  openaddpostscreenbool:boolean=false;
  openaddpostscreenboolfilter:boolean=false;
  searchText: string = '';
  user: any;
  dropdownVisible: boolean = false;
  showtheonlinestatusindicator:boolean = true;
  private openDropdown: HTMLElement | null = null;
  optionsVisible: boolean = false;
  optionsVisiblefilter: boolean = false;
  isfilteropen: boolean = false;
  isclikedpopulargroups: boolean = false;
  isclikedprivacypolicy: boolean = false;
  isclikedattributes: boolean = false;  
  postType: string = "";

  @ViewChild('mainlogo', { static: true }) mainLogo!: ElementRef;
 
  constructor(private notificationService: NotificationService,private http:HttpClient,private renderer: Renderer2,private router:Router) {}

  ngOnInit(): void {
    this.userid = localStorage.getItem('wmd') || '';
    if(this.userid !=''){
      this.getuserdetails(this.userid);
    }


    this.renderer.listen('window', 'load', () => {
      this.updateOnlineStatus(this.userid);

    });

    this.renderer.listen('document', 'visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
         this.updatethehiddenvisibility(this.userid);
      } else if (document.visibilityState === 'visible') {
        
        if (this.mainLogo.nativeElement.offsetWidth > 0 && this.mainLogo.nativeElement.offsetHeight > 0) {
          this.updateOnlineStatus(this.userid);
        }
      }
    });


  }


  closepopgroupsmobile(): void{
    this.isclikedpopulargroups = false;
    this.isclikedprivacypolicy = false;
    this.isclikedattributes = false;
  }
  handleOptionSelection(option: string) {
    this.optionsVisiblefilter=!this.optionsVisiblefilter;
    this.optionsVisible = !this.optionsVisible; 
    this.optionSelectedInFeed.emit(option); 
  }

  navitating(e: Event, navigatetype: string): void {
    e.stopPropagation(); 
    this.optionsVisiblefilter=!this.optionsVisiblefilter;
    this.optionsVisible = !this.optionsVisible; 
    
    switch (navigatetype) {
      case 'home':
        this.router.navigate(['/home/followers-feed']);
        break;
      case 'signup':
        this.router.navigate(['/auth/sign-up']);
        break;
      case 'login':
        this.router.navigate(['/auth/log-in']);
        break;

      case 'globle':
        this.router.navigate(['/']);
        break;
      case 'notifications':
        this.getNotifications();
        break;
      case 'populargroups':
        this.isclikedpopulargroups = true;
        break;
      case 'interactions':
        this.router.navigate(['/interactions']);
        break;
      case 'settings':
        this.router.navigate(['/home/settings', this.userid]);
        break;
      case 'profile':
        this.router.navigate(['/home/profile', this.userid]);
        break;
      case 'privacypolicy':
        this.isclikedprivacypolicy = true;
        break;
      case 'attributes':
        this.isclikedattributes = true;
        break;
      default:
        console.warn('Unknown navigation type:', navigatetype);
    }
  }


  toggleOptions(): void {
    this.isfilteropen=false;
    this.optionsVisible = !this.optionsVisible; 
    this.optionsVisiblefilter=!this.optionsVisiblefilter;

  }
  toggleOptionsfilter(): void {
    this.isfilteropen=true;
    this.optionsVisiblefilter=!this.optionsVisiblefilter;
    this.optionsVisible = !this.optionsVisible; 
  }

  closefiltermobile():void{
    this.optionsVisible = !this.optionsVisible; 
    this.optionsVisiblefilter=!this.optionsVisiblefilter;


  }

async updatethehiddenvisibility(userid:any){
  const formData = new FormData();
  
  if (userid) {
    formData.append('userid', userid);

    this.http.post(this.APIURL + 'update_online_status_hidden', formData).subscribe({
      next: (response: any) => {
    
 
        this.showtheonlinestatusindicator=false;
   
      },
      error: error => {
        console.error('There was an error posting the data!', error);
      }
    });
  } else {
    console.error('User ID is not available in session storage.');
  }
}



  async updateOnlineStatus(userid: any): Promise<void> {
    const formData = new FormData();
 
    if (userid) {
      formData.append('userid', userid);
  
      this.http.post(this.APIURL + 'update_online_status', formData).subscribe({
        next: (response: any) => {
 

          this.showtheonlinestatusindicator=true;
   

        },
        error: error => {
          console.error('There was an error posting the data!', error);
        }
      });
    } else {
      console.error('User ID is not available in session storage.');
    }
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
  

  gotohomepage(e:Event):void{
    e.preventDefault();
    this.router.navigate(['/']);

  }
  
  handleSearchText(text: string) {
    this.searchText = text;
  }
  logout(): void {
    const token = localStorage.getItem('jwt');

    if (token) {
   
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      console.log(headers);
      this.http.post(this.APIURL + 'logout', {}, { headers }).subscribe({
        next: (response: any) => {
          console.log('Logged out successfully');
         
          localStorage.clear();
          
        
          this.showSignOutMessage = true;

      
          setTimeout(() => {
            this.showSignOutMessage = false;
            location.reload();
          }, 3000);
        },
        error: (error) => {
          console.error('Logout error:', error);
       
        }
      });
    } else {
      console.log('No token found, skipping logout.');
    
      location.reload();

    }
  }


  

  getNotifications(): void {
    this.updatingusernotificationseenstatus();
    this.notificationService.triggerNotification();
  }

  async updatingusernotificationseenstatus(): Promise<void> {
    const formData = new FormData();
    formData.append('userid', this.userid.toString());

    this.http.post<any>(`${this.APIURL}update_user_notification_seen_status`, formData).subscribe({
        next: (response: any) => {
     
            if (response.message === "seen") {
                this.getuserdetails(this.userid);
            } else {
                console.error('Unexpected response message:', response.message);
            }
        },
        error: (error: HttpErrorResponse) => {
            console.error('There was an error!', error);
        }
    });
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







  showvideos(e: Event): void {
    this.isfilteropen=true;
    this.optionsVisiblefilter=!this.optionsVisiblefilter;
    this.optionsVisible = !this.optionsVisible;
    e.preventDefault();
    e.stopPropagation();
    this.optionSelected.emit('video');



  }

  showlinks(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.optionSelected.emit('link');
    this.isfilteropen=true;
    this.optionsVisiblefilter=!this.optionsVisiblefilter;
    this.optionsVisible = !this.optionsVisible;
   


  }


  showtexts(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    this.optionSelected.emit('text');
 

  }




  showimages(e: Event): void {
    this.optionsVisiblefilter=!this.optionsVisiblefilter;
    e.preventDefault();
    e.stopPropagation();
    this.optionSelected.emit('image');

  }


  showvoices(e: Event): void {
    this.optionsVisiblefilter=!this.optionsVisiblefilter;
    e.preventDefault();
    e.stopPropagation();

    this.optionSelected.emit('audio');
  }


}
