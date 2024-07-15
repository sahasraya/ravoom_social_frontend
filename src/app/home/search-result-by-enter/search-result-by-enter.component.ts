import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostComponent } from '../../widgets/post/post.component';

@Component({
  selector: 'app-search-result-by-enter',
  standalone: true,
  imports: [CommonModule,PostComponent],
  templateUrl: './search-result-by-enter.component.html',
  styleUrl: './search-result-by-enter.component.css'
})
export class SearchResultByEnterComponent  implements OnInit{
 
 
  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  searchtext: string = '';
  APIURL = 'http://127.0.0.1:8000/';
  responseObject: any = [];

  videoPosts: any[] = [];
  audioPosts: any[] = [];
  imagePosts: any[] = [];
  textPosts: any[] = [];
  linkPosts: any[] = [];
  ImageTextLinkPosts: any[] = [];
  TextLinkPosts: any[] = [];
  UserList: any[] = [];

  showImagetextLinkPostsBool: boolean = true;
  showAudioPostsBool: boolean = false;
  showImagePostsBool: boolean = false;
  showTextPostsBool: boolean = false;
  showLinkPostsBool: boolean = false;
  showVideoPostsBool: boolean = false;
  showTextLinkPostsBool: boolean = false;
  showUserBool: boolean = false;

  linkPreviewData: any = null;

  ngOnInit(): void {
    this.searchtext = this.route.snapshot.paramMap.get('text')!;
    this.getResult(this.searchtext);
    this.getImageTextImageLink(this.searchtext);
    this.getTextLink(this.searchtext);
    this.getLinkPreview('https://en.wikipedia.org/wiki/Sri_Lanka'); 
    this.getUser(this.searchtext);
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
      next: response => {
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

    this.http.post<any>(`${this.APIURL}search-enter-press-result-image-link-text`, formData).subscribe({
      next: response => {
        this.responseObject = response;
        
        
     
        this.ImageTextLinkPosts = [];

        this.responseObject.forEach((post: any) => {
          if (post.userprofile) {
            post.userprofileUrl = this.createBlobUrl(post.userprofile, 'image/jpeg'); 
          }

          if (post.post) {
            post.postUrl = this.createBlobUrl(post.post, 'image/jpeg'); 
          }

    
          this.ImageTextLinkPosts.push(post);
        });

        
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
      }
    });
  }


  getResult(searchtext: string) {
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
