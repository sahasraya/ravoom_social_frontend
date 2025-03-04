import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostComponent } from '../../widgets/post/post.component';
import { SharedServiceService } from '../../services/shared-service.service';
import { environment } from '../../../environments/environment';
import { ProfileComponent } from '../profile/profile.component';
import { HeaderComponent } from '../../widgets/header/header.component';
import { useridexported } from '../../auth/const/const';

@Component({
  selector: 'app-search-result-by-enter',
  standalone: true,
  imports: [CommonModule,PostComponent,RouterModule,ProfileComponent,HeaderComponent],
  templateUrl: './search-result-by-enter.component.html',
  styleUrl: './search-result-by-enter.component.css'
})
export class SearchResultByEnterComponent  implements OnInit{
 
 
  constructor(private route: ActivatedRoute, private http: HttpClient,private sharedservice:SharedServiceService) {}

  searchtext: string = '';
  profileowneruid: string = '';
  userid:string='';
  APIURL = environment.APIURL;
  responseObject: any = [];
  responseObjectTextImageLink: any = [];

  videoPosts: any[] = [];
  audioPosts: any[] = [];
  imagePosts: any[] = [];
  textPosts: any[] = [];
  linkPosts: any[] = [];
  ImageTextLinkPosts: any[] = [];
  TextLinkPosts: any[] = [];
  UserList: any[] = [];
  GroupList: any[] = [];

  showImagetextLinkPostsBool: boolean = true;
  showAudioPostsBool: boolean = false;
  showImagePostsBool: boolean = false;
  showTextPostsBool: boolean = false;
  showLinkPostsBool: boolean = false;
  showVideoPostsBool: boolean = false;
  showTextLinkPostsBool: boolean = false;
  showUserBool: boolean = false;
  showGroupBool: boolean = false;
  isclickedtoshowuser: boolean = false;

  linkPreviewData: any = null;


  offsetgroup = 0;
  offsetuser = 0;
  offsettextlink = 0;
  offsetvideo = 0;
  offsettextimagelink = 0;
  limitgroup = 10;  
  limituser = 10;  
  limittextlink = 10;  
  limitvideo = 10;  
  limittextimagelink = 10;  
  moreDataAvailable = true;
  moreDataAvailableuser = true;
  moreDataAvailablelink = true;
  moreDataAvailablevideo = true;
  moreDataAvailabletextimagelink = true;



  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.searchtext = params.get('text')!;
      this.getVideos(this.searchtext);
      this.getImageTextImageLink(this.searchtext);
      this.getTextLink(this.searchtext);
      this.getLinkPreview('https://en.wikipedia.org/wiki/Sri_Lanka'); 
      this.getUser(this.searchtext);
      this.getGroup(this.searchtext);

      this.userid = useridexported;
      
      
    });
  
  }

 

  closeprofilewindow(): void{
    this.isclickedtoshowuser = false 
    
  }
   
  showtheuserprofile(event: Event, navigatingprofileuserid: string): void {
    event.preventDefault(); 
    this.profileowneruid = navigatingprofileuserid; 
    this.isclickedtoshowuser = true;
  }

async getGroup(searchtext: string):Promise<void>{
    
  const formData = new FormData();

 
    formData.append('searchtext', searchtext);
    formData.append('limit', this.limitgroup.toString());
    formData.append('offset', this.offsetgroup.toString());

  this.http.post<any>(`${this.APIURL}search-enter-press-get-groups`, formData).subscribe({
    next: response => {
      this.responseObject = response;
  
      if (this.offsetgroup === 0) {
  
        this.GroupList = [];
      }

      this.responseObject.forEach((post: any) => {
        if (post.groupimage) {
          post.userprofileUrl = this.createBlobUrl(post.groupimage, 'image/jpeg'); 
        }
      this.GroupList.push(post);

      this.moreDataAvailable = response.length === this.limitgroup;

      if(this.GroupList.length > 0){

        this.showImagetextLinkPostsBool = false;
        this.showAudioPostsBool = false;
        this.showImagePostsBool = false;
        this.showTextPostsBool = false;
        this.showLinkPostsBool = false;
        this.showVideoPostsBool = false ;
        this.showTextLinkPostsBool = false;
        this.showUserBool =false;
        this.showGroupBool= true;

      }
      });

      
    },
    error: (error: HttpErrorResponse) => {
      console.error('There was an error!', error);
    }
  });

}





loadMore() {
  if (this.moreDataAvailable) {
    this.offsetgroup += this.limitgroup; 
    this.getGroup(this.searchtext);      
  }
}



loadMoreTextLinks(e:Event) {
  e.preventDefault();
  e.stopPropagation();
 
 
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

  this.offsettextlink += this.limittextlink;

  this.getTextLink(this.searchtext).then(() => {
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition, behavior: 'auto' });
    }, 0);   
  });

      
 
}



loadMoreVideos(e:Event) {
  e.preventDefault();
  e.stopPropagation();
 
  if (this.moreDataAvailablevideo) {
    this.offsetvideo += this.limitvideo; 
    this.getVideos(this.searchtext);      
  }
}






loadMoreUser() {
  if (this.moreDataAvailableuser) {
    this.offsetuser += this.limituser; 
    this.getUser(this.searchtext);      
  }
}




async getTextLink(searchtext: string) {
  // if (!this.moreDataAvailablelink) {
  //   console.log('No more data to load.');
  //   return;
  // }

  const formData = new FormData();
  formData.append('searchtext', searchtext);
  formData.append('limit', this.limittextlink.toString());
  formData.append('offset', this.offsettextlink.toString());

  this.http.post<any>(`${this.APIURL}search-enter-press-result-link-text`, formData).subscribe({
    next: (response: any) => {
      this.responseObject = response;

      if (this.offsettextlink === 0) {
        this.TextLinkPosts = [];
      }

      this.responseObject.forEach((post: any) => {
        if (post.userprofile) {
          post.userprofileUrl = this.createBlobUrl(post.userprofile, 'image/jpeg'); 
        }

        if (post.post) {
          post.postUrl = this.createBlobUrl(post.post, 'image/jpeg'); 
        }

        this.TextLinkPosts.push(post);
      });

      this.moreDataAvailablelink = response.length === this.limittextlink;

      if (this.TextLinkPosts.length > 0) {
        this.showImagetextLinkPostsBool = false;
        this.showAudioPostsBool = false;
        this.showImagePostsBool = false;
        this.showTextPostsBool = false;
        this.showLinkPostsBool = false;
        this.showVideoPostsBool = false;
        this.showTextLinkPostsBool = true;
        this.showUserBool = false;
        this.showGroupBool = false;
      }
    },
    error: (error: HttpErrorResponse) => {
      console.error('There was an error!', error);
    }
  });
}




async getVideos(searchtext: string): Promise<void> {
 
  const formData = new FormData();
  formData.append('searchtext', searchtext);
  formData.append('limit', this.limitvideo.toString());
  formData.append('offset', this.offsetvideo.toString());

  this.http.post<any>(`${this.APIURL}search-enter-press-result`, formData).subscribe({
    next: response => {
   
      this.responseObject = response;

      if (this.offsetvideo === 0) {

        this.videoPosts = [];
      }

      
      this.responseObject.forEach((post: any) => {
     
        if (post.userprofile) {
          post.userprofileUrl = this.createBlobUrl(post.userprofile, 'image/jpeg'); 
        }

        if (post.post) {
        
          const base64Data = post.post;
            const blob = this.convertBase64ToBlob(base64Data, 'video/mp4');
            post.postUrl = URL.createObjectURL(blob);
            
        }

  
        this.videoPosts.push(post);
        this.moreDataAvailablevideo = response.length === this.limitvideo;
        
        
    
        if(this.videoPosts.length > 0){

          this.showImagetextLinkPostsBool = false;
          this.showAudioPostsBool = false;
          this.showImagePostsBool = false;
          this.showTextPostsBool = false;
          this.showLinkPostsBool = false;
          this.showVideoPostsBool = true ;
          this.showTextLinkPostsBool = false;
          this.showUserBool =false;
          this.showGroupBool= false;
  
        }


      });



    },
    error: (error: HttpErrorResponse) => {
      console.error('There was an error!', error);
    }
  });
}

  

async getImageTextImageLink(searchtext: string, clearPosts: boolean = false): Promise<void> {
  const formData = new FormData();
  formData.append('searchtext', searchtext);
  formData.append('limit', this.limittextimagelink.toString());
  formData.append('offset', this.offsettextimagelink.toString());

  return new Promise<void>((resolve, reject) => {
    this.http.post<any>(`${this.APIURL}search-enter-press-result-image-link-text`, formData).subscribe({
      next: (response: any) => {
        if (clearPosts) {
          this.ImageTextLinkPosts = [];
        }

        const uniquePosts = this.filterDuplicatePosts(response);

        const processedPosts = this.processPosts(uniquePosts);

        this.ImageTextLinkPosts.push(...processedPosts);


        this.moreDataAvailabletextimagelink = response.length === this.limittextimagelink;

        resolve();
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);

        reject(error);
      }
    });
  });
}

private filterDuplicatePosts(posts: any[]): any[] {
  const existingPostIds = new Set(this.ImageTextLinkPosts.map(post => post.postid));  
  return posts.filter(post => !existingPostIds.has(post.postid));  
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


  
  
  
loadMoreTextImageLink(e: Event) {
  e.preventDefault();
  e.stopPropagation();

  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

  this.offsettextimagelink += this.limittextimagelink;

  // Pass false here to append data
  this.getImageTextImageLink(this.searchtext, false);
}

// When performing a new search or first load
performNewSearch(searchtext: string) {
  // Set offset to 0 to start from the beginning
  this.offsettextimagelink = 0;
  
  // Pass true here to clear existing posts before loading new data
  this.getImageTextImageLink(searchtext, true);
}





async getUser(searchtext: string): Promise<void> {
  

  const formData = new FormData();
  formData.append('searchtext', searchtext);
  formData.append('limit', this.limituser.toString());
  formData.append('offset', this.offsetuser.toString());

  this.http.post<any>(`${this.APIURL}search-enter-press-get-users`, formData).subscribe({
    next: (response: any) => {
      this.responseObject = response;

      if (this.offsetuser === 0) {
        this.UserList = [];
      }

      this.responseObject.forEach((user: any) => {
        if (user.profileimage) {
          user.userprofileUrl = this.createBlobUrl(user.profileimage, 'image/jpeg'); 
        }

        this.UserList.push(user);
      });

      // Check if more data is available based on response length
      this.moreDataAvailableuser = response.length === this.limituser;

      // Update visibility based on user data
      if (this.UserList.length > 0) {
        this.showImagetextLinkPostsBool = false;
        this.showAudioPostsBool = false;
        this.showImagePostsBool = false;
        this.showTextPostsBool = false;
        this.showLinkPostsBool = false;
        this.showVideoPostsBool = false;
        this.showTextLinkPostsBool = false;
        this.showUserBool = true;
      }
    },
    error: (error: HttpErrorResponse) => {
      console.error('There was an error!', error);
    }
  });
}






  getLinkPreview(url: string) {
    const formData = new FormData();
    formData.append('url', url);

    this.http.post<any>(`${this.APIURL}get-preview`,  formData ).subscribe({
      next: (data) => {
        this.linkPreviewData = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching link preview:', error);
      }
    });
  }








  

  async joingroup(grouptype: any, groupid: any, username: string, userid: any): Promise<void> {
 
    this.sharedservice.joinGroup(grouptype,groupid,username,userid,this.userid);

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





  base64ToBlob(base64: string, contentType: string = ''): Blob {
    try {
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
    } catch (error) {
      console.error('Failed to convert base64 to Blob:', error);
      return new Blob();
    }
  }

  createBlobUrl(base64: string, contentType: string): string {
    const blob = this.base64ToBlob(base64, contentType);
    return URL.createObjectURL(blob);
  }

 

  showTextPosts(): void {
    this.showImagetextLinkPostsBool = false;
    this.showAudioPostsBool = false;
    this.showImagePostsBool = false;
    this.showTextPostsBool = true;
    this.showLinkPostsBool = false;
    this.showVideoPostsBool = false ;
    this.showTextLinkPostsBool = false;
    this.showUserBool =false;
    this.showGroupBool= false;
    
  }

  showImagePosts(): void {
    this.showImagetextLinkPostsBool = false;
    this.showAudioPostsBool = false;
    this.showImagePostsBool = true;
    this.showTextPostsBool = false;
    this.showLinkPostsBool = false;
    this.showVideoPostsBool = false ;
    this.showTextLinkPostsBool = false;
    this.showUserBool =false;
    this.showGroupBool= false;





  }

  showAudioPosts(): void {
    this.showImagetextLinkPostsBool = false;
    this.showAudioPostsBool = true;
    this.showImagePostsBool = false;
    this.showTextPostsBool = false;
    this.showLinkPostsBool = false;
    this.showVideoPostsBool = false ;
    this.showTextLinkPostsBool = false;
    this.showUserBool =false;
    this.showGroupBool= false;





  }

  showTextImageLinkPosts(): void {
    this.showImagetextLinkPostsBool = true;
    this.showAudioPostsBool = false;
    this.showImagePostsBool = false;
    this.showTextPostsBool = false;
    this.showLinkPostsBool = false;
    this.showVideoPostsBool = false ;
    this.showTextLinkPostsBool = false;
    this.showUserBool =false;
    this.showGroupBool= false;





  }

  showLinkPosts():void{
    this.showImagetextLinkPostsBool = false;
    this.showAudioPostsBool = false;
    this.showImagePostsBool = false;
    this.showTextPostsBool = false;
    this.showLinkPostsBool = true;
    this.showVideoPostsBool = false ;
    this.showTextLinkPostsBool = false;
    this.showUserBool =false;
    this.showGroupBool= false;




  }
  showVideoPosts():void{
    this.showImagetextLinkPostsBool = false;
    this.showAudioPostsBool = false;
    this.showImagePostsBool = false;
    this.showTextPostsBool = false;
    this.showLinkPostsBool = false;
    this.showVideoPostsBool = true;
    this.showTextLinkPostsBool = false;
    this.showUserBool =false;
    this.showGroupBool= false;



  }

  showTextLinkPosts():void{
    this.showImagetextLinkPostsBool = false;
    this.showAudioPostsBool = false;
    this.showImagePostsBool = false;
    this.showTextPostsBool = false;
    this.showLinkPostsBool = false;
    this.showVideoPostsBool = false;
    this.showTextLinkPostsBool = true;
    this.showUserBool =false;
    this.showGroupBool= false;


  }

  showUser():void{
    this.showImagetextLinkPostsBool = false;
    this.showAudioPostsBool = false;
    this.showImagePostsBool = false;
    this.showTextPostsBool = false;
    this.showLinkPostsBool = false;
    this.showVideoPostsBool = false;
    this.showTextLinkPostsBool = false;
    this.showUserBool =true;
    this.showGroupBool= false;

  }



  showGroups():void{
    this.showImagetextLinkPostsBool = false;
    this.showAudioPostsBool = false;
    this.showImagePostsBool = false;
    this.showTextPostsBool = false;
    this.showLinkPostsBool = false;
    this.showVideoPostsBool = false;
    this.showTextLinkPostsBool = false;
    this.showUserBool =false;
    this.showGroupBool= true;

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
  
}
