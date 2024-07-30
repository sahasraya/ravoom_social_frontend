import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, Inject, Input, OnInit, Output } from '@angular/core';
import { Route, Router, RouterModule } from '@angular/router';
import { ImageLargerComponent } from '../image-larger/image-larger.component';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule,RouterModule,PostComponent,ImageLargerComponent],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent implements OnInit {

  @Input() post: any;
  @Output() delete = new EventEmitter<void>();


  
  imageUrl: string = '';
  profileImageUrl: string = '';
  videoUrl: string = '';
  audioUrl :string='';
  likes: number = 0;
  comments: number = 0;
  APIURL = 'http://127.0.0.1:8000/';
  showLargerImage: boolean = false;
  postToBeDeleted: any = null;
  isthelastcomment:boolean=false;
  followButtonText :string = 'Follow';
  userid: string = "";
  btntext:string = "";


  constructor(private cdref: ChangeDetectorRef,private http:HttpClient,private router:Router,@Inject(PLATFORM_ID) private platformId: Object) {}
  ngOnInit(): void {
       
    this.getpostlikecount();
    this.getpostcommentCount();
    this.getfollowingstatus(this.post.userid);

    if (isPlatformBrowser(this.platformId)) {
 
      this.userid = localStorage.getItem('wmd') || '';
 
    }


    this.checkisamemberofgroup(this.userid);

      if (this.post.posttype === 'video') {
      const base64Data = this.post.post;
    

      try {
 
        const blob = this.convertBase64ToBlob(base64Data, 'video/mp4');
        this.videoUrl = URL.createObjectURL(blob);
   
      } catch (error) {
        
      }
      
      this.imageUrl = '';
      this.audioUrl = '';
    }
 
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
          
         


          if(response.exists){
           this.followButtonText = "Following";
           }else{
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


 async iamstartedtofollow(iamfollowinguserid:any):Promise<void>{

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

     if(this.post.n_or_g =="g"){
      const params = new HttpParams().set('postid', this.post.postid.toString());
      try {
        const response: any = await this.http.get<any>(`${this.APIURL}get_like_count_group`, { params }).toPromise();
        
        if (response.like_count !== undefined) {
          this.likes = response.like_count;
        }
      } catch (error) {
        console.error('There was an error!', error);
      }
     }else{
      const params = new HttpParams().set('postid', this.post.postid.toString());
      try {
        const response: any = await this.http.get<any>(`${this.APIURL}get_like_count`, { params }).toPromise();
        
        if (response.like_count !== undefined) {
          this.likes = response.like_count;
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

  ngAfterContentChecked() {
   
 
    if (this.post.posttype === 'image'  ) {
     
   
      this.imageUrl = this.createBlobUrl(this.post.image, 'image/jpeg');
      this.videoUrl = '';
      this.audioUrl = '';
    } else if (this.post.posttype === 'audio') {
      const base64Data = this.post.post;
   
      const blob = this.convertBase64ToBlobAudio(base64Data);
      this.audioUrl = URL.createObjectURL(blob);
      this.imageUrl = '';
      this.videoUrl = '';
    }

    else if (this.post.posttype === 'text') {
 
    
      this.profileImageUrl = this.createBlobUrl(this.post.userprofile, 'image/jpeg');

      this.audioUrl = '';
      this.imageUrl = '';
      this.videoUrl = '';
       
    }

    else if (this.post.posttype === 'link') {
 
    
      this.profileImageUrl = this.createBlobUrl(this.post.userprofile, 'image/jpeg');

      this.audioUrl = '';
      this.imageUrl = '';
      this.videoUrl = '';
       
    }

    else if (this.post.posttype === 'group') {
 
    
      this.profileImageUrl = this.createBlobUrl(this.post.userprofile, 'image/jpeg');

      this.audioUrl = '';
      this.imageUrl = '';
      this.videoUrl = '';
       
    }




    if (this.post.userprofile) {
      this.profileImageUrl = this.createBlobUrl(this.post.userprofile, 'image/jpeg');
    }
    this.cdref.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);  
    }
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);  
    }
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);  
    }
    if (this.profileImageUrl) {
      URL.revokeObjectURL(this.profileImageUrl);  
    }
  }


 
 
  
  convertBase64ToBlobAudio(base64Data: string): Blob {
    return this.convertBase64ToBlob(base64Data, 'audio/mpeg');
  }


 async likePost(postid: number, userid: number, username: string, profileimage: string,normalorgroup:any):Promise<void> {

  if (this.userid == ''){
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

   if(normalorgroup =="g"){
    this.http.post(this.APIURL + 'add_post_like_group', formData).subscribe({
      next: (response: any) => {
      if(response.message == "no"){

        this.likes ++;
         
      }else{
        this.likes --;
        this.http.post(this.APIURL + "send-notification",formData).subscribe({
          next:(response:any) =>{
                  
          }
        });
      }
         
        // Handle success response
      },
      error: error => {
        console.error('There was an error!', error);
      }
    });
   }else{
    this.http.post(this.APIURL + 'add_post_like', formData).subscribe({
      next: (response: any) => {
      if(response.message == "no"){

        this.likes ++;
        this.http.post(this.APIURL + "send-notification",formData).subscribe({
          next:(response:any) =>{
                    
          }
        });
      }else{
        this.likes --;
        this.http.post(this.APIURL + "send-notification",formData).subscribe({
          next:(response:any) =>{
                     
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

  commentOnPost(postid:any,n_or_g: any): void {
    
    this.router.navigate([`/home/comment/${postid}/${n_or_g}`]);

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

  removePost(postId: any): void {
    this.postToBeDeleted = true;

    console.log('Removing post with ID:', postId);
  }

  @HostListener('document:click', ['$event'])
  closeAllDropdowns(event?: MouseEvent): void {
    this.post.showDropdown = false;
    this.cdref.detectChanges();
  }



  removePostYes(postId: any): void {
    const params = new HttpParams().set('postid', postId.toString());
    
    this.http.get<any>(`${this.APIURL}delete_post`, { params }).subscribe({
      next: (response: any) => {
   

        if (response.message === 'Deleted') {
          this.delete.emit();
        }
        this.postToBeDeleted = false;
        this.cdref.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
      }
    });
  }


  cancelDeleteComment(): void {
    this.postToBeDeleted = false;
  }


  async joingroup(grouptype: any, groupid: any, username: string, userid: any): Promise<void> {
 
    if (grouptype === "public") {
      this.router.navigate(['home/group', groupid]);
    } else if (userid == this.userid){
      this.router.navigate(['home/group', groupid]);
       
    }   else {
      const result = confirm("You have to ask for permission from " + username + " to join this group. Do you need to ask permission?");

      if (result) {
        const formData = new FormData();
        formData.append('groupid', groupid);
        formData.append('groupownerid', userid);
        formData.append('myuserid', this.userid);

        try {
          const response = await this.http.post<any>(`${this.APIURL}ask_permission_from_admin_to_join_group`, formData).toPromise();
          console.log(response.message);

    
          alert(response.message);
        } catch (error) {
          console.error('There was an error!', error);
 
          alert('There was an error sending the permission request. Please try again later.');
        }
      }
    }
  }
  
}
