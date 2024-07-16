import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-popular-post',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popular-post.component.html',
  styleUrl: './popular-post.component.css'
})
export class PopularPostComponent  implements OnInit{

  APIURL = 'http://127.0.0.1:8000/';
  popularPosts: any[] = [];
  likeCounts: any[] = [];
  imagePosts: any[] = [];
  audioPosts: any[] = [];
  videoPosts: any[] = [];
  textPosts: any[] = [];
  linkPosts: any[] = [];
  showImagePostsBool: boolean = false;
  showAudioPostsBool: boolean = false;
  showVideoPostsBool: boolean = false;
  showTextPostsBool: boolean = false;
  showLinkPostsBool: boolean = false;



constructor(private http:HttpClient,private router:Router){}

  ngOnInit(): void {
    this.getpopularpostsfromlikes();
  }





  async getpopularpostsfromlikes(): Promise<void> {
    this.http.get<{ posts: any[], like_counts: any[] }>(this.APIURL + "get-popular-posts-from-like-count").subscribe({
      next: (res) => {
        this.popularPosts = res.posts;
        this.likeCounts = res.like_counts;
  
        this.imagePosts = [];
        this.audioPosts = [];
        this.videoPosts = [];
        this.textPosts = [];
        this.linkPosts = [];
  
        this.popularPosts.forEach(post => {
          if (post.userprofile) {
            post.userprofileUrl = this.createBlobUrl(post.userprofile, 'image/jpeg');
          }
  
          if (post.posttype === 'image' && post.post) {
            post.postUrl = this.createBlobUrl(post.post, 'image/jpeg');
            this.imagePosts.push(post);
          } else if (post.posttype === 'audio') {
            this.audioPosts.push(post);
          } else if (post.posttype === 'video') {
            this.videoPosts.push(post);
          } else if (post.posttype === 'text') {
            this.textPosts.push(post);
          }
          else if (post.posttype === 'link') {
            this.linkPosts.push(post);
           
          }
        });
  
        this.showImagePostsBool = this.imagePosts.length > 0;
        this.showAudioPostsBool = this.audioPosts.length > 0;
        this.showVideoPostsBool = this.videoPosts.length > 0;
        this.showTextPostsBool = this.textPosts.length > 0;
        this.showLinkPostsBool = this.linkPosts.length > 0;
  
        console.log("Popular Posts:", this.popularPosts);
        console.log("Like Counts:", this.likeCounts);
      },
      error: (err) => {
        console.error('Error fetching popular posts:', err);
      }
    });
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




  nanigatetocommentsscreen(postdid:any, norg:string):void{
    
 
    this.router.navigate(['/home/comment', postdid,norg]);
  }
}
