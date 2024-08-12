import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostComponent } from '../../widgets/post/post.component';

@Component({
  selector: 'app-search-result-by-enter',
  standalone: true,
  imports: [CommonModule,PostComponent,RouterModule],
  templateUrl: './search-result-by-enter.component.html',
  styleUrl: './search-result-by-enter.component.css'
})
export class SearchResultByEnterComponent  implements OnInit{
 
 
  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  searchtext: string = '';
  APIURL = 'http://127.0.0.1:8000/';
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

  linkPreviewData: any = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.searchtext = params.get('text')!;
      // this.getResult(this.searchtext);
      this.getImageTextImageLink(this.searchtext);
      this.getTextLink(this.searchtext);
      this.getLinkPreview('https://en.wikipedia.org/wiki/Sri_Lanka'); 
      this.getUser(this.searchtext);
      this.getGroup(this.searchtext);
    });
  
  }


   

async getGroup(searchtext: string):Promise<void>{
    
  const formData = new FormData();
  formData.append('searchtext', searchtext);
  this.http.post<any>(`${this.APIURL}search-enter-press-get-groups`, formData).subscribe({
    next: response => {
      this.responseObject = response;
  
      this.GroupList = [];

      this.responseObject.forEach((post: any) => {
        if (post.groupimage) {
          post.userprofileUrl = this.createBlobUrl(post.groupimage, 'image/jpeg'); 
        }
      this.GroupList.push(post);
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







async getUser(searchtext: string):Promise<void>{
  
  const formData = new FormData();
  formData.append('searchtext', searchtext);

  this.http.post<any>(`${this.APIURL}search-enter-press-get-users`, formData).subscribe({
    next: response => {
      this.responseObject = response;
 
      this.UserList = [];

      this.responseObject.forEach((post: any) => {
        if (post.profileimage) {
          post.userprofileUrl = this.createBlobUrl(post.profileimage, 'image/jpeg'); 
        }

        

  
        this.UserList.push(post);

        if(this.UserList.length > 0){
          this.showImagetextLinkPostsBool = false;
          this.showAudioPostsBool = false;
          this.showImagePostsBool = false;
          this.showTextPostsBool = false;
          this.showLinkPostsBool = false;
          this.showVideoPostsBool = false ;
          this.showTextLinkPostsBool = false;
          this.showUserBool =true;
        }

      });

      
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

  async getTextLink(searchtext: string) {
    const formData = new FormData();
    formData.append('searchtext', searchtext);

 

    this.http.post<any>(`${this.APIURL}search-enter-press-result-link-text`, formData).subscribe({
      next: (response:any) => {
        this.responseObject = response;
      
        
     
        this.TextLinkPosts = [];

        this.responseObject.forEach((post: any) => {
          if (post.userprofile) {
            post.userprofileUrl = this.createBlobUrl(post.userprofile, 'image/jpeg'); 
          }

          if (post.post) {
            post.postUrl = this.createBlobUrl(post.post, 'image/jpeg'); 
          }

    
          this.TextLinkPosts.push(post);


         


          if(this.TextLinkPosts.length > 0){

            this.showImagetextLinkPostsBool = false;
            this.showAudioPostsBool = false;
            this.showImagePostsBool = false;
            this.showTextPostsBool = false;
            this.showLinkPostsBool = false;
            this.showVideoPostsBool = false ;
            this.showTextLinkPostsBool = true;
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



  async getImageTextImageLink(searchtext: string) {
    const formData = new FormData();
    formData.append('searchtext', searchtext);
    this.responseObjectTextImageLink = [];
 
    this.http.post<any>(`${this.APIURL}search-enter-press-result-image-link-text`, formData).subscribe({
      next: (response:any) => {
    
        this.responseObjectTextImageLink = [...this.responseObjectTextImageLink, ...this.processPosts(response)];
 

       this.ImageTextLinkPosts = [];

        this.responseObjectTextImageLink.forEach((post: any) => {
           
          this.ImageTextLinkPosts.push(post);

          


          if(this.ImageTextLinkPosts.length > 0){

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
        

    
        });
        
      },


      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
      }
    });

 
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


  async getResult(searchtext: string):Promise<void> {
    const formData = new FormData();
    formData.append('searchtext', searchtext);

    this.http.post<any>(`${this.APIURL}search-enter-press-result`, formData).subscribe({
      next: response => {
        this.responseObject = response;
        this.responseObject.forEach((post: any) => {
          if (post.userprofile) {
            post.userprofileUrl = this.createBlobUrl(post.userprofile, 'image/jpeg'); 
            post.postUrl = this.createBlobUrl(post.post, 'image/jpeg'); 
       

          }

           

          switch (post.posttype) {
            case 'video':
              this.videoPosts.push(post);
              break;
            case 'audio':
              this.audioPosts.push(post);
              break;
            case 'image':
              this.imagePosts.push(post);
              break;
            case 'text':
              this.textPosts.push(post);
              break;
            case 'link':
              this.linkPosts.push(post);
              break;
          }

          alert(this.videoPosts);
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
      }
    });
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

  getContentType(posttype: string): string {
    switch (posttype) {
      case 'video':
        return 'video/mp4';
      case 'audio':
        return 'audio/mpeg';
      case 'image':
        return 'image/jpeg';
      case 'link':
        return 'image/jpeg';
      default:
        return '';
    }
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
