import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostComponent } from '../../widgets/post/post.component';
import { AddPostComponent } from '../../widgets/add-post/add-post.component';
import { ImageLargerComponent } from '../../widgets/image-larger/image-larger.component';
import { environment } from '../../../environments/environment';
import { useridexported } from '../../auth/const/const';
import { ProfileStateService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PostComponent,
    AddPostComponent,
    ImageLargerComponent
    
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent   {
  @Input() profileowneruid: string | undefined;

 
  userid: any;
  getfrommethoduserid:any;
  limit = 4;
  limitfav = 4;
  offset = 0;
  offsetfav = 0;
  profileImageUrl: string = '';  
  postType: string = "";
  APIURL = environment.APIURL;
  showLargerImage: boolean = false;
  openaddpostscreenbool: boolean = false;
  username:string = "";
  followButtonText:string= "Follow";
  showfeedBool:boolean = true;
  showoptionsmenu:boolean=false;
  showfavelistBool:boolean = false;
  showblockedlistBool:boolean = false;
  showgrouplistBool:boolean = false;
  showmygrouplistBool:boolean = true;
  showfollowinggrouplistBool:boolean = false;
  loading = false;
  loadingfav = false;
  showiamfolloeduserlistBool:boolean = false;
  showiamfollowinguserlistBool:boolean = false;

  user: any;
  userfrommethod:any;
  profileData:any;
  posts:any[]=[];
  iamfollowinguserslist: any[] = [];
  iamfolloweduserslist: any[] = [];
  faveposts: any[] = [];
  blockedusers: any[] = [];
  mygroups: any[] = [];
  iamfollowinggroups: any[] = [];

  constructor( private profileStateService:ProfileStateService, private http: HttpClient, private route: ActivatedRoute,private cdref: ChangeDetectorRef,private router:Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
    this.userid = params.get('uid')!;
    this.getfrommethoduserid = useridexported;
      this.loadInitialData();
      if (this.profileowneruid) {
      this.getUserDetails(this.profileowneruid);
        
      } else if (this.userid != '') {
      
        const cachedData = this.profileStateService.getState(this.userid);
        if (cachedData) {
          this.profileData = cachedData;
          this.user = this.profileData;  
          this.processProfileDetails(); 
        } else {
          this.getUserDetails(this.userid);
        }
        
        this.getiamfolloinguserlist(this.userid);
        this.getiamfolloeduserlist(this.userid);
        this.getuserdetailsFrommethod(this.getfrommethoduserid);
        this.getfavList(this.userid);
        this.getfollowingstatus(this.getfrommethoduserid);
        this.getblockedlist(this.userid);
        this.getmygrouplist(this.userid);
        this.getiamfollowinggrouplist(this.userid);
    }  
    
      else {  
      this.iamfollowinguserslist = [];
      this.iamfolloweduserslist= [];
      this.userfrommethod = null;
    }
 
    });
 

  }


  loadInitialData(): void {
    this.posts = [];  
    this.offset = 0;
  
  
    const cachedPosts = this.profileStateService.getState(this.userid);

    if (cachedPosts) {
      this.posts = cachedPosts.posts;   
      this.offset = this.posts.length;
      this.processProfilePostsdata(); 
    
    } else {

      if (this.profileowneruid) {
        this.getPostsFeed(this.profileowneruid);
        if (this.getfrommethoduserid) {
          this.userid = this.getfrommethoduserid;
          this.getfollowingstatus(this.profileowneruid);
        }
      } else {
        this.getPostsFeed(this.userid);
      }
    }
  }
  async unblockuser(blockeduserid: string): Promise<void> {
    const formData = new FormData();
    formData.append('blockeduserid', blockeduserid);  
  
    this.http.post<any>(`${this.APIURL}remove_blocked_user`, formData).subscribe({
      next: (response: any) => {
        if (response.message === "removed") {
          alert("User unblocked successfully");
          this.getblockedlist(this.userid);  
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error unblocking user:', error);
      }
    });
  }
  
  async getblockedlist(userid:string): Promise<void>{
    const formDataUser = new FormData();
    formDataUser.append('userid', userid); 

    try {
      const response: any = await this.http.post<any[]>(`${this.APIURL}get_blocked_user_list`, formDataUser).toPromise();
      if (response) {
        this.blockedusers = response.blocked_users;
        this.blockedusers.forEach(user => {
          if (user.blockeduserprofile) {
            user.blockeduserprofile = this.createBlobUrl(user.blockeduserprofile, 'image/jpeg');  
          }
        });
      }
       
    } catch (error) {
      console.error('There was an error!', error);
    } 
  }

  async getmygrouplist(userid: string): Promise<void> {
    const formDataUser = new FormData();
    formDataUser.append('userid', userid); 
  
    try {
      const response: any = await this.http.post<any[]>(`${this.APIURL}get_my_group_list`, formDataUser).toPromise();
      if (response && response.serialized_groups) {
        this.mygroups = response.serialized_groups;   
  
        this.mygroups.forEach(group => {
          if (group.groupimage) {
            group.groupimage = this.createBlobUrl(group.groupimage, 'image/jpeg');  
          }
        });
   
      }
    } catch (error) {
      console.error('There was an error!', error);
    }
  }
  
  async getiamfollowinggrouplist(userid: string): Promise<void> {
    const formDataUser = new FormData();
    formDataUser.append('userid', userid);   
  
    try {
      const response: any = await this.http.post<any[]>(`${this.APIURL}get_iamfollowing_group_list`, formDataUser).toPromise();
      
      if (response && response.serialized_my_follwoing_groups) {
        this.iamfollowinggroups = response.serialized_my_follwoing_groups;    
    
        this.iamfollowinggroups.forEach(group => {
          if (group.groupimage) {
            group.groupimage = this.createBlobUrl(group.groupimage, 'image/jpeg');  
          }
        });
        
 
      }
    } catch (error) {
      console.error('There was an error!', error);   
    }
  }
  


  processProfilePostsdata(): void { 

  
    if (Array.isArray(this.posts)) {
      
      this.faveposts = this.posts.filter(post => post.isFavorite); 
      this.iamfollowinguserslist = this.posts.filter(post => post.isFollowing);  
  
      this.posts = this.posts.map((post: any) => ({
        ...post,
        formattedDate: this.formatDate(post.createdAt),  
      }));
    }
  
    this.cdref.detectChanges();
  }
  


 

  processProfileDetails(): void {
 
    if (!this.profileData) {
      console.error("No profile data to process.");
      return;
    }
  
    this.username = this.profileData.username || "Unknown User";
    if (this.profileData.profileImage) {
      this.profileImageUrl = this.createBlobUrl(this.profileData.profileImage, "image/jpeg");
 

  
    } else {
      this.profileImageUrl = "assets/default-profile.png";  
    }
  
    if (this.profileData.followingStatus !== undefined) {
      this.followButtonText = this.profileData.followingStatus ? "Following" : "Follow";
    }
  
    if (Array.isArray(this.profileData.posts)) {
      this.posts = this.profileData.posts.map((post: any) => ({
        ...post,
        formattedDate: this.formatDate(post.createdAt), 
      }));
    }
  
    if (Array.isArray(this.profileData.favoritePosts)) {
      this.faveposts = this.profileData.favoritePosts;
    }
  
    if (Array.isArray(this.profileData.iamFollowing)) {
      this.iamfollowinguserslist = this.profileData.iamFollowing;
    }
  
    if (Array.isArray(this.profileData.iamFollowed)) {
      this.iamfolloweduserslist = this.profileData.iamFollowed;
    }
  
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  async getPostsFeed(userid:string): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    const formDataUser = new FormData();
    formDataUser.append('userid', userid);
    formDataUser.append('limit', this.limit.toString());
    formDataUser.append('offset', this.offset.toString());

    try {
      const response = await this.http.post<any[]>(`${this.APIURL}get_posts_feed_user`, formDataUser).toPromise();
      this.posts = [...this.posts, ...this.processPosts(response!)];
      this.offset += this.limit;
      const updatedProfileData = { ...this.profileData, posts: this.posts };
      this.profileStateService.saveState(userid, updatedProfileData);
      this.cdref.detectChanges();
    } catch (error) {
      console.error('There was an error!', error);
    } finally {
      this.loading = false;
    }
  }

  async getUserDetails(userid: string): Promise<void> {
    const formData = new FormData();
    formData.append('userid', userid.toString());
  
    this.http.post<any>(`${this.APIURL}get_user_details`, formData).subscribe({
      next: (response: any) => {
        this.user = response;
        this.username = response.username;
  
        this.profileStateService.saveState(userid, response);
        this.profileData = response;
  
        this.processProfileDetails();
      },
      error: (error: HttpErrorResponse) => {
        console.error("There was an error!", error);
      },
    });
  }
  





  


  async iamstartedtofollow(iamfollowinguserid: any): Promise<void> {

    const formData = new FormData();
    formData.append('myuserid', iamfollowinguserid);
    formData.append('iamfollowinguserid', this.userid);

     



    this.http.post(this.APIURL + 'start-to-follow', formData).subscribe({
      next: (response: any) => {


        this.toggleFollowButtonText();
      },
      error: error => {
        console.error('There was an error!', error);
      }
    });

  }


  toggleFollowButtonText(): void {
    this.followButtonText = this.followButtonText === 'Follow' ? 'Following' : 'Follow';
  }





  async getfollowingstatus(postownerid: any): Promise<void> {
    let params = new HttpParams()
          .set('postownerid', this.userid.toString())
          .set('userid', postownerid.toString());

        try {
          const response: any = await this.http.get<any>(`${this.APIURL}following-status`, { params }).toPromise();

          if (response.exists) {
            this.followButtonText = "Following";
          } else {
            this.followButtonText = "Follow";


          }

          if (response.exists) {
            console.log('The user is following the post owner.');
          } else {
            console.log('The user is not following the post owner.');
          }
        } catch (error) {
          console.error('There was an error!', error);
        }
      
     
  }







  onPostRemoved(postid: number): void {
    
    this.faveposts = this.faveposts.filter(post => post.postid !== postid);
  }

  async getfavList(userid: number): Promise<void> {
    if (this.loadingfav) return;
  
    this.loadingfav = true;
  
    
    this.http.get<any[]>(`${this.APIURL}get_fav_list?userid=${userid}&limitfav=${this.limitfav}&offsetfav=${this.offsetfav}`).subscribe({
      next: (res) => {
        this.faveposts = [...this.faveposts, ...this.processPosts(res)];
        this.offsetfav += this.limitfav;
        this.loadingfav = false;
        this.cdref.detectChanges();
 
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.loadingfav = false;
      }
    });
  }
  



  
  async getuserdetailsFrommethod(userid:string):Promise<void>{
    const formData = new FormData();
    formData.append('userid', userid);

    this.http.post<any>(`${this.APIURL}get_user_details`, formData).subscribe({
      next: (response:any) => {
        
        this.userfrommethod = response;  
        console.log('Data type of userfrommethod.userid:', typeof this.userfrommethod?.userid);
        console.log('Data type of userid:', typeof this.userid);
    
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
         
      }
    });
  }
  showtheuserlisttofollow():void{
    this.router.navigate(['/home/userlist-to-follow'])
  }



 async getiamfolloeduserlist(userid: string): Promise<void> {
    const formData = new FormData();
    formData.append('userid', userid);

    this.http.post<any[]>(`${this.APIURL}get_iamfolloweduserlist`, formData).subscribe({
      next: (response: any[]) => {
        this.iamfolloweduserslist = response;

     
 
        this.iamfolloweduserslist.forEach(user => {
          if (user.profile) {
            user.profileImageUrl = this.createBlobUrl(user.profile, 'image/jpeg');
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
      }
    });
  }


 async getiamfolloinguserlist(userid: string): Promise<void> {
    const formData = new FormData();
    formData.append('userid', userid);

    this.http.post<any[]>(`${this.APIURL}get_iamfollowinguserlist`, formData).subscribe({
      next: (response: any[]) => {
        this.iamfollowinguserslist = response;
 
        this.iamfollowinguserslist.forEach(user => {
          if (user.profile) {
            user.profileImageUrl = this.createBlobUrl(user.profile, 'image/jpeg');
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



toggleOptionsSelecter(e:Event):void{
  e.preventDefault();
  e.stopPropagation();

  this.showoptionsmenu=!this.showoptionsmenu;

}


openaddpostscreen(type: string): void {
  this.postType = type;
  this.openaddpostscreenbool = true;
}

 



@HostListener('window:scroll', ['$event'])
onScroll(event: Event): void {
    const element = document.documentElement;

    if ((element.scrollHeight - element.scrollTop <= element.clientHeight + 1) && !this.loading) {
        localStorage.removeItem('scrollPosition');


        if(this.showfavelistBool){
            this.getfavList(this.userid);
        }else{
          if (this.profileowneruid) {
            this.getPostsFeed(this.profileowneruid);
          } else {
            this.getPostsFeed(this.userid);
            
          }

        }
    }
}



 

private processPosts(posts: any[]): any[] {
  const processedPosts: any[] = [];
  posts.forEach(post => {
 
    const existingPost = processedPosts.find(p => p.postid === post.postid);

    if (existingPost) {
      if (post.image) {
        existingPost.images.push(post.image);
      }
    } else {
      const newPost = {
        ...post,
        images: post.posttype === 'image' && post.image ? [post.image] : []
      };
      processedPosts.push(newPost);
    }
  });

  return processedPosts;
}








onImageClick(): void {
  this.showLargerImage = true;
}

 
onCloseLargerImage(): void {
  this.showLargerImage = false;
}
onPostAdded(): void {
  this.getPostsFeed(this.userid);  
}




showfeed():void{
  this.showfeedBool = true;
  this.showiamfolloeduserlistBool = false;
  this.showiamfollowinguserlistBool = false;
  this.showfavelistBool = false;
  this.showblockedlistBool = false;
  this.showgrouplistBool = false;
}
 

showiamfollowinguserlist():void{
  this.showfeedBool = false;
  this.showiamfolloeduserlistBool = false;
  this.showiamfollowinguserlistBool = true;
  this.showfavelistBool = false;
  this.showblockedlistBool = false;
  this.showgrouplistBool = false;

}

showiamfolloeduserlist():void{
  this.showfeedBool = false;
  this.showiamfolloeduserlistBool = true;
  this.showiamfollowinguserlistBool = false;
  this.showfavelistBool = false;
  this.showblockedlistBool = false;
  this.showgrouplistBool = false;

}
showfavelist():void{
  this.showfeedBool = false;
  this.showiamfolloeduserlistBool = false;
  this.showiamfollowinguserlistBool = false;
  this.showfavelistBool = true;
  this.showblockedlistBool = false;
  this.showgrouplistBool = false;
  }
  
  showblockedlist():void{
    this.showfeedBool = false;
    this.showblockedlistBool = true;
    this.showiamfolloeduserlistBool = false;
    this.showiamfollowinguserlistBool = false;
    this.showfavelistBool = false;
    this.showgrouplistBool = false;
  }

  showgrouplist():void{
    this.showfeedBool = false;
    this.showblockedlistBool = false;
    this.showiamfolloeduserlistBool = false;
    this.showiamfollowinguserlistBool = false;
    this.showfavelistBool = false;
    this.showgrouplistBool = true;
  }

  showmygrouplist(): void{
    this.showmygrouplistBool = true;
    this.showfollowinggrouplistBool = false;
    
  }
  showfollowinggrouplist(): void{
    this.showmygrouplistBool = false;
    this.showfollowinggrouplistBool = true;
  }


 
async removeIAMFollowingUser(e:Event, userid: string): Promise<void> {
  e.preventDefault();
  e.stopPropagation();
 
  const result = confirm("Do you want to remove this follower?");
  if (result) {
    const formData = new FormData();
    formData.append('otheruserid', userid);
    formData.append('myuid', this.userid);

    this.http.post<any>(`${this.APIURL}remove-user-from-iamfollowing`, formData).subscribe({
        next: (response: any) => {
            if (response.message === "removed") {
              this.getiamfolloinguserlist(this.userid);
              this.getiamfolloeduserlist(this.userid);
            }
        },
        error: (error: HttpErrorResponse) => {
            console.error('Error removing user:', error);
        }
    });
  }
}

toggleDropdown(event: MouseEvent, user: any): void {
  event.preventDefault();   
  event.stopPropagation();
  this.closeAllDropdowns(user); 
  user.showDropdown = !user.showDropdown;
  this.cdref.detectChanges();
}


@HostListener('document:click', ['$event'])
closeAllDropdowns(event: MouseEvent): void {
  this.iamfollowinguserslist.forEach(user => user.showDropdown = false);
  this.iamfolloweduserslist.forEach(user => user.showDropdown = false);
  this.cdref.detectChanges();
}



}
