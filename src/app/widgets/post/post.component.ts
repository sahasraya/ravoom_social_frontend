import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { ImageLargerComponent } from '../image-larger/image-larger.component';
import { PLATFORM_ID } from '@angular/core';
import { ReporttingComponent } from '../reportting/reportting.component';
import { SharedServiceService } from '../../services/shared-service.service';
import { environment } from '../../../environments/environment';
import { CommentComponent } from '../../home/comment/comment.component';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, RouterModule, PostComponent, ImageLargerComponent,ReporttingComponent,CommentComponent],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent implements OnInit {
  APIURL = environment.APIURL;

  @Input() post: any;
  @Output() delete = new EventEmitter<void>();
  @ViewChild('memberMainOuterHolder') memberMainOuterHolder!: ElementRef<HTMLDivElement>;
  @Output() postRemoved = new EventEmitter<number>();


  postreport = 'postreport'; 
  imageUrl: string = '';
  profileImageUrl: string = '';
  groupImageUrl: string = '';
  videoUrl: string = '';
  audioUrl: string = '';
  likes: number = 0;
  comments: number = 0;
  showLargerImage: boolean = false;
  postToBeDeleted: any = null;
  isthelastcomment: boolean = false;
  showreportscreenBool:boolean=false;
  addedtofav:boolean=false;
  onlinestatus:boolean=true;
  islikedmembereddivvisible:boolean=false;
  followButtonText: string = 'Follow';
  checkuseridtoroutecommentscreen: string = "";
  userid: string = "";
  btntext: string = "";
  screen: string = "";
  likedMembers:any[]=[];
  groupid:string="";
  favtext:string="";
  likedornottext :string = "";
  offset = 0;
  limit = 10;
  loadingMoreMembers = false;
  hasMoreMembers = false;
  getthecommentsBool:boolean = false;
  groupornormalpost:string= "";
  selectedPostId: string | null = null;
  backgroundStyle: { [key: string]: string } = {};
  currentImageIndex: number = 0;



  constructor(private cdref: ChangeDetectorRef,private renderer: Renderer2, private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object, private route: ActivatedRoute,private sharedservice:SharedServiceService,) { }
  ngOnInit(): void {
    this.checkuseridtoroutecommentscreen = this.route.snapshot.paramMap.get('uid')!; 
    this.getpostlikecount();
    this.getpostcommentCount();
    this.getfollowingstatus(this.post.userid);
    if (isPlatformBrowser(this.platformId)) {
      this.userid = localStorage.getItem('wmd') || '';
      if(this.userid){
        this.getisaddedtofav(this.post,this.post.postid);
      }

    }
    this.checkisamemberofgroup(this.userid);
    if (this.post.posttype === 'video') {
      const base64Data = this.post.post;
      try {
        const blob = this.convertBase64ToBlob(base64Data, 'video/mp4');
        this.videoUrl = URL.createObjectURL(blob);
      } catch (error) {}
      this.imageUrl = '';
      this.audioUrl = '';
    } if(this.userid !=''){
      this.checkTheOnlineStatus(this.post.userid);

    }
  }

  ngAfterContentChecked() {
    if (this.post.posttype === 'image' && !this.imageUrl) {
      this.loadCurrentImage();
    } else if (this.post.posttype === 'audio' && !this.audioUrl) {
      const base64Data = this.post.post;
      const blob = this.convertBase64ToBlobAudio(base64Data);
      this.audioUrl = URL.createObjectURL(blob);
    } else if (this.post.posttype === 'text' && !this.profileImageUrl) {
      this.profileImageUrl = this.createBlobUrl(this.post.userprofile, 'image/jpeg');
    } else if (this.post.posttype === 'link' && !this.profileImageUrl) {
      this.profileImageUrl = this.createBlobUrl(this.post.userprofile, 'image/jpeg');
    } else if (this.post.posttype === 'group') {
      if (!this.profileImageUrl) {
        this.profileImageUrl = this.createBlobUrl(this.post.userprofile, 'image/jpeg');
      }
      if (!this.groupImageUrl) {
        this.groupImageUrl = this.createBlobUrl(this.post.post, 'image/jpeg');
      }
    }
  
    this.cleanupUnusedUrls();
    
    this.cdref.detectChanges();
  }


  loadCurrentImage(): void {
    const image = this.post.images[this.currentImageIndex];
    this.imageUrl = this.createBlobUrl(image, 'image/jpeg');
    this.backgroundStyle = {
      'background-image': `url(${this.imageUrl})`,
      'background-color': '#d9d9d9',
      'background-size': 'cover',
      'background-position': 'center',
      'filter': 'blur(50px)',
      'opacity': '0.4',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'border-radius': '10px',
      'position': 'relative',
    };
  }


  nextImage(): void {
    if (this.currentImageIndex < this.post.images.length - 1) {
      this.currentImageIndex++;
      this.loadCurrentImage();
    }
  }
 
  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.loadCurrentImage();
    }
  }




async getlikeedmembers(postid: number): Promise<void> {
  this.islikedmembereddivvisible = true;  
  this.cdref.detectChanges();
  const formData = new FormData();
  formData.append('postid', postid.toString());
  formData.append('limit', this.limit.toString());
  formData.append('offset', this.offset.toString());

  try {
    this.groupid = this.route.snapshot.paramMap.get('groupid') || '';
  
    if(this.groupid !=""){
       
      const response: any = await this.http.post(this.APIURL + 'get_liked_members_group', formData).toPromise();
      const newMembers = response.map((member: any) => ({
        username: member.username,
        profileimage: this.createBlobUrl(member.profileimage, 'image/jpeg')
      }));
      this.likedMembers = [...this.likedMembers, ...newMembers];
      this.offset += this.limit;
      this.loadingMoreMembers = false;
      if(this.likedMembers.length >= 10){
        this.hasMoreMembers= true;
      }
    }else{
      

      const response: any = await this.http.post(this.APIURL + 'get_liked_members', formData).toPromise();
      const newMembers = response.map((member: any) => ({
        username: member.username,
        profileimage: this.createBlobUrl(member.profileimage, 'image/jpeg')
      }));
      this.likedMembers = [...this.likedMembers, ...newMembers];
      this.offset += this.limit;
      this.loadingMoreMembers = false;
      if(this.likedMembers.length >= 10){
        this.hasMoreMembers= true;
      }
    }
    
  } catch (error) {
    console.error('There was an error!', error);
    this.loadingMoreMembers = false;  
  }
}


  async getisaddedtofav(post: any, postid: number): Promise<void> {
    const formData = new FormData();
    formData.append('userid', this.userid.toString());
    formData.append('postid', postid.toString());
  

  
    this.http.post<any>(`${this.APIURL}is_added_to_fav`, formData).subscribe({
      next: (response: any) => {
        if (response.message === 'exists') {
          post.isSaved = true;  
      
        } else if (response.message === 'not_found') {
          

          post.isSaved = false; 
        }
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 422) {
          alert('Invalid data submitted.');
        } else if (error.status === 500) {
          alert('Server error. Please try again later.');
        } else {
          alert('An unexpected error occurred.');
        }
        console.error('Error checking favorite post:', error);
      }
    });
  }
  


  async loadMoreMembers(e:Event): Promise<void> {
    e.preventDefault();
    

    this.loadingMoreMembers = true;

    try {
      const response: any = await this.getlikeedmembers(this.post.postid);
     
      if (response && response.length > 0) {
        const newMembers = response.map((member: any) => ({
          username: member.username,
          profileimage: this.createBlobUrl(member.profileimage, 'image/jpeg')
        }));
        this.likedMembers = [...this.likedMembers, ...newMembers];
        this.offset += this.limit;
      } else {
        this.hasMoreMembers = false;  
      }
    } catch (error) {
      console.error('There was an error!', error);
    } finally {
      this.loadingMoreMembers = false;
    }
  }

 

 

 

 

async savepost(e: Event, postid: number,post:any): Promise<void> {
  e.preventDefault();
  const formData = new FormData();
  formData.append('userid', this.userid.toString());
  formData.append('postid', postid.toString());

  this.http.post<any>(`${this.APIURL}save_fav_post`, formData).subscribe({
    next: (response: any) => {
      if (response.message === 'saved') {
        post.isSaved = true;
        this.addedtofav=true;
        this.favtext="Post added to favorites !";

        setTimeout(() => {
          this.addedtofav=false;
        }, 5000);
        
      } else if (response.message === 'removed') {
        post.isSaved = false;
        this.addedtofav=true;
        this.favtext="Post removed from favorites !";
        setTimeout(() => {
          this.addedtofav=false;
        }, 5000);
        this.postRemoved.emit(postid);
      
      }
    },
    error: (error: HttpErrorResponse) => {
      if (error.status === 422) {
        this.favtext="Error: Invalid data submitted.";
        setTimeout(() => {
          this.addedtofav=false;
        }, 1000);

       
      } else if (error.status === 500) {
        this.favtext="Server error. Please try again later.";
        setTimeout(() => {
          this.addedtofav=false;
        }, 1000);
 
      } else {
        this.favtext="An unexpected error occurred.";
        setTimeout(() => {
          this.addedtofav=false;
        }, 1000);

       
      }
      console.error('Error saving favorite post:', error);
    }
  });
}

 




closememebrslikeddiv(e:Event):void{
  e.preventDefault();
  this.islikedmembereddivvisible=false;
  this.getthecommentsBool=false;

}
  async checkTheOnlineStatus(userid: any): Promise<void> {
    const formData = new FormData();
    formData.append('userid', userid);
  
    this.http.post<any>(`${this.APIURL}check_postowner_online_status`, formData).subscribe({
      next: (response: any) => {
        if (response.message === "online") {
            this.onlinestatus = true;
        } else if (response.message === "offline") {
          this.onlinestatus = false;
      
     
        } else {
          console.error('Unexpected response:', response);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error checking online status:', error);
      }
    });
  }


  convertBase64ToBlob(base64: string, mimeType: string): Blob {
    const base64Data = base64.replace(/^data:video\/mp4;base64,/, '');
    const byteChars = atob(base64Data);
    const byteNums = new Array(byteChars.length);

    for (let i = 0; i < byteChars.length; i++) {
      byteNums[i] = byteChars.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNums);
    return new Blob([byteArray], { type: mimeType });
  }




  async checkisamemberofgroup(userid: any) {
    const formData = new FormData();
    formData.append('userid', userid);
    formData.append('groupid', this.post.groupid);

    this.http.post<any>(`${this.APIURL}check-isa-member-of-group`, formData).subscribe({
      next: (response: any) => {
        if (response.message == "yes") {
          this.btntext = "joined";
        } else if (response.message == "no") {
          this.btntext = "join now";
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error checking group membership:', error);
      }
    });
  }





  async getfollowingstatus(postownerid: any): Promise<void> {
    if (this.post) {
      const myuserid: string | null = localStorage.getItem('wmd');


      if (myuserid) {
        let params = new HttpParams()
          .set('postownerid', postownerid.toString())
          .set('userid', myuserid.toString());

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
      } else {
        console.error('User ID is not available in session storage.');
      }
    } else {
      console.error('Post object is not initialized or missing postid.');
    }
  }


  async iamstartedtofollow(iamfollowinguserid: any): Promise<void> {

    const formData = new FormData();
    formData.append('myuserid', this.userid);
    formData.append('iamfollowinguserid', iamfollowinguserid);
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

  async getpostlikecount(): Promise<void> {
    if (this.post && this.post.postid) {


      const dotElement = document.querySelector(`.dot-blue[data-postid="${this.post.postid}"]`);
      if (this.post.n_or_g == "g") {
        const params = new HttpParams().set('postid', this.post.postid.toString());
        try {
          const response: any = await this.http.get<any>(`${this.APIURL}get_like_count_group`, { params }).toPromise();

          if (response.like_count !== undefined) {
            this.likes = response.like_count;

            if (this.userid !== '') {
              const paramstocheckuserliked = new HttpParams()
                  .set('postid', this.post.postid.toString())
                  .set('userid', this.userid.toString());

              const likeCheckResponse: any = await this.http.get<any>(`${this.APIURL}check_curruntuser_liked_or_not_group`, { params: paramstocheckuserliked }).toPromise();
              
              if (likeCheckResponse.message === "yes") {
                  dotElement?.classList.add('liked-dot');
              } else {
                  dotElement?.classList.remove('liked-dot');
              }
          }
            
          }
        } catch (error) {
          console.error('There was an error!', error);
        }
      } else {
        const params = new HttpParams().set('postid', this.post.postid.toString());
        try {
          const response: any = await this.http.get<any>(`${this.APIURL}get_like_count`, { params }).toPromise();

          if (response.like_count !== undefined) {
            this.likes = response.like_count;

            if (this.userid !== '') {
              const paramstocheckuserliked = new HttpParams()
                  .set('postid', this.post.postid.toString())
                  .set('userid', this.userid.toString());

               

              const likeCheckResponse: any = await this.http.get<any>(`${this.APIURL}check_curruntuser_liked_or_not`, { params: paramstocheckuserliked }).toPromise();
              
              if (likeCheckResponse.message === "yes") {
                  dotElement?.classList.add('liked-dot');
                
                  this.likedornottext = "yes";
              } else {
                  dotElement?.classList.remove('liked-dot');
               

                  this.likedornottext = "no";

              }
          }



          }
        } catch (error) {
          console.error('There was an error!', error);
        }
      }

    } else {
      console.error('Post object is not initialized or missing postid.');
    }
  }



  async getpostcommentCount(): Promise<void> {
    if (this.post && this.post.postid) {
      const params = new HttpParams().set('postid', this.post.postid.toString());
      try {
        const response: any = await this.http.get<any>(`${this.APIURL}get_comments_count`, { params }).toPromise();

        if (response.comment_count !== undefined) {
          this.comments = response.comment_count;
        }
      } catch (error) {
        console.error('There was an error!', error);
      }
    } else {
      console.error('Post object is not initialized or missing postid.');
    }
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
  
  
  
  
  cleanupUnusedUrls(): void {
    if (!this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
      this.imageUrl = '';
    }
    if (!this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
      this.videoUrl = '';
    }
    if (!this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = '';
    }
    if (!this.profileImageUrl) {
      URL.revokeObjectURL(this.profileImageUrl);
      this.profileImageUrl = '';
    }
    if (!this.groupImageUrl) {
      URL.revokeObjectURL(this.groupImageUrl);
      this.groupImageUrl = '';
    }
  }
  
  ngOnDestroy(): void {
    this.cleanupUnusedUrls();
  }




  convertBase64ToBlobAudio(base64Data: string): Blob {
    return this.convertBase64ToBlob(base64Data, 'audio/mpeg');
  }


  async likePost(postid: number, userid: number, username: string, profileimage: string, normalorgroup: any): Promise<void> {

    const dotElement = document.querySelector(`.dot-blue[data-postid="${postid}"]`);
    const dotElement1 = document.querySelector(`.liked-dot[data-postid="${postid}"]`);
 

    if (this.userid == '') {
      this.router.navigate(['/auth/log-in']);
      return;
    }

    const myuserid: string | null = localStorage.getItem('wmd');
    const formData = new FormData();
    formData.append('postid', postid.toString());
    formData.append('userid', userid.toString());
    formData.append('currentuserid', myuserid!);
    formData.append('username', username);
    formData.append('commenttext', '.');
    formData.append('notificationtype', 'like');
    formData.append('profileimage', profileimage);
    formData.append('replytext', ".");

    if (normalorgroup == "g") {
      this.http.post(this.APIURL + 'add_post_like_group', formData).subscribe({
        next: (response: any) => {
          if (response.message == "no") {

            this.likes++;
        
            dotElement?.classList.remove('dot-blue');
            dotElement?.classList.add('liked-dot');
            

          } else {
            this.likes--;
            dotElement?.classList.remove('liked-dot');
            dotElement1?.classList.remove('liked-dot');
            dotElement1?.classList.add('dot-blue');
            this.http.post(this.APIURL + "send-notification", formData).subscribe({
              next: (response: any) => {

              }
            });
          }

          // Handle success response
        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    } else {
      this.http.post(this.APIURL + 'add_post_like', formData).subscribe({
        next: (response: any) => {
          if (response.message == "no") {

            this.likes++;
            dotElement?.classList.remove('dot-blue');
            dotElement?.classList.add('liked-dot');

            this.http.post(this.APIURL + "send-notification", formData).subscribe({
              next: (response: any) => {

              }
            });
          } else {
            this.likes--;
            dotElement?.classList.remove('liked-dot');
            dotElement1?.classList.remove('liked-dot');
            dotElement1?.classList.add('dot-blue');
            this.http.post(this.APIURL + "send-notification", formData).subscribe({
              next: (response: any) => {

              }
            });
          }

          // Handle success response
        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    }




  }

  commentOnPost(event: MouseEvent, postid: any, n_or_g: any): void {
    event.preventDefault();

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
 
    localStorage.setItem('scrollPosition', scrollPosition.toString());
    localStorage.setItem('nav', 'yes');


    if (this.checkuseridtoroutecommentscreen != null) {
      this.screen = "pro";
      this.router.navigate([`/home/comment/${postid}/${n_or_g}/${this.screen}/${this.checkuseridtoroutecommentscreen}`]);
    } else {
      this.screen = "home";
      this.router.navigate([`/home/comment/${postid}/${n_or_g}/${this.screen}/`]);
    }
  }



  calculateTimeAgo(postedDate: string): string {
    const now = new Date();
    const postDate = new Date(postedDate);
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return 'yesterday';
    } else {
      return postDate.toLocaleDateString();
    }
  }




  toggleDropdown(event: MouseEvent, post: any): void {
    event.stopPropagation();
    this.closeAllDropdowns();
    post.showDropdown = !post.showDropdown;
    this.cdref.detectChanges();
  }

 

  @HostListener('document:click', ['$event'])
  closeAllDropdowns(event?: MouseEvent): void {
    this.post.showDropdown = false;
    this.cdref.detectChanges();
  }



  removePost(postId: any): void {
   
    const userConfirmed = window.confirm("Do you want to delete this post?");
  
 
    if (userConfirmed) {
      const params = new HttpParams()
        .set('postid', postId.toString())
        .set('userid', this.userid.toString());
  
      const token = localStorage.getItem('jwt');
      if (!token) {
        alert("Unauthorized access. Please check your credentials.");
        return;
      }
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
  
      const options = { headers, params };
  
      this.http.get<any>(`${this.APIURL}delete_post`, options).subscribe({
        next: (response: any) => {
          if (response.message === 'Deleted') {
            this.delete.emit();
          }
          this.postToBeDeleted = false;
          this.cdref.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            alert("Unauthorized access. Please check your credentials.");
          }
          if (error.status === 500) {
            alert("Internal server error.");
          }
          console.error('There was an error!', error);
        }
      });
    } else {
      // User chose not to delete the post
      console.log("User canceled the deletion.");
    }
  }
  


  cancelDeleteComment(): void {
    this.postToBeDeleted = false;
  }


  navigatetouser():void{
 

 this.router.navigate([`/home/profile/${this.post.userid}`]);
  }



  async joingroup(grouptype: any, groupid: any, username: string, userid: any): Promise<void> {
 
    this.sharedservice.joinGroup(grouptype,groupid,username,userid,this.userid);
  }


  getthecomments(event: Event, postid: string,type:string): void {
    event.stopPropagation();
    this.selectedPostId = postid; 
    this.groupornormalpost=type;
    this.getthecommentsBool = true; 
  }


  



  showreportscreen():void{
  this.showreportscreenBool=true;
  }
  closeReportScreen():void{
  this.showreportscreenBool=false;

  }
}
