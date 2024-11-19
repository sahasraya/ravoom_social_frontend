import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren, AfterViewInit, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommentComponent } from '../comment/comment.component';
import { environment } from '../../../environments/environment';
import { useridexported } from '../../auth/const/const';

@Component({
  selector: 'app-video-slider',
  standalone: true,
  imports: [CommonModule,RouterModule,CommentComponent],
  templateUrl: './video-slider.component.html',
  styleUrls: ['./video-slider.component.css']
})
export class VideoSliderComponent implements OnInit, AfterViewInit {

  @ViewChild('videoHolder') videoHolder!: ElementRef<HTMLDivElement>;
  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;

  APIURL = environment.APIURL;
  offset = 0;
  limit = 15;
  isLoading = false;
  getthecommentsBool:boolean = false;
  selectedPostId: string | null = null;
  videoList: any[] = [];
  userid:string = "";
  likes: number = 0;
  likedornottext: { [postid: string]: string } = {};

  screen: string = 'screen'; 
  viode_inner_holder_responsiveness:string = 'viode_inner_holder_pc';
 

  private scrollListener!: () => void;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.getAllVideoPosts();
    this.userid = useridexported;
  

  }

  ngAfterViewInit(): void {
    if (this.videoHolder) {
      this.scrollListener = () => this.onScroll();
      this.videoHolder.nativeElement.addEventListener('scroll', this.scrollListener);
      this.initializeIntersectionObserver();
    } else {
      console.error('videoHolder is not defined');
    }
  }

 
 

  async getpostlikecount(postid: any): Promise<number> {
  
    const params = new HttpParams().set('postid', postid.toString());
    
    try {
      const response: any = await this.http.get<any>(`${this.APIURL}get_like_count`, { params }).toPromise();
  
      if (this.userid) {
        const paramstocheckuserliked = new HttpParams()
          .set('postid', postid.toString())
          .set('userid', this.userid.toString());
  
        const likeCheckResponse: any = await this.http.get<any>(`${this.APIURL}check_curruntuser_liked_video_or_not`, { params: paramstocheckuserliked }).toPromise();
  
     
  
        if (likeCheckResponse.message === "yes") {
          this.likedornottext[postid] = "yes"; 
        } else {
          this.likedornottext[postid] = "no";  
        }
      }
  
      return response.like_count !== undefined ? response.like_count : 0;
    } catch (error) {
      console.error('There was an error!', error);
      return 0;
    }
  }
  
  


  getthecomments(event: Event, postid: string): void {
    event.stopPropagation();
    this.selectedPostId = postid; 
    this.getthecommentsBool = true; 
  }



  private initializeIntersectionObserver(): void {
    const options = {
      root: this.videoHolder.nativeElement,
      rootMargin: '0px',
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const videoElement = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          videoElement.play().catch(error => console.error('Error playing video:', error));
        } else {
          videoElement.pause();
        }
      });
    }, options);

 
    this.videoElements.changes.subscribe(() => {
      this.videoElements.forEach(videoElement => observer.observe(videoElement.nativeElement));
    });
  }

  onScroll(): void {
    if (!this.videoHolder) return;

    const element = this.videoHolder.nativeElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const offsetHeight = element.offsetHeight;

    if ((scrollTop + offsetHeight) >= scrollHeight && !this.isLoading) {
      if (this.limit !== 15 && this.limit > 15) {
        this.getAllVideoPosts();
      }
    }
  }

  async getAllVideoPosts(): Promise<void> {
    if (this.isLoading) return;
  
    this.isLoading = true;
    this.http.get<any[]>(`${this.APIURL}get_all_video_posts_slider?limit=${this.limit}&offset=${this.offset}`).subscribe({
      next: async (response: any[]) => {
        const processedVideos = await Promise.all(response.map(async (video) => {
          if (video.post) {
            const base64Data = video.post;
            const blob = this.convertBase64ToBlob(base64Data, 'video/mp4');
            video.videoUrl = URL.createObjectURL(blob);
          }
          if (video.userprofile) {
            video.profileImageUrl = this.createBlobUrl(video.userprofile, 'image/jpeg');
          }
  
          video.username = video.username;  
          video.posteddate = video.posteddate;
          video.postdescription = video.postdescription;
  
          video.likeCount = await this.getpostlikecount(video.postid);
          console.log(video.likeCount);
          return video;
        }));
  
        this.videoList = processedVideos;
        this.isLoading = false;
      },
      error: error => {
        console.error('There was an error!', error);
        this.isLoading = false;
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






  convertBase64ToBlob(base64: string, mimeType: string): Blob {
    const base64Data = base64.split(',').pop() || base64;
    const byteChars = atob(base64Data);
    const byteNums = new Array(byteChars.length);

    for (let i = 0; i < byteChars.length; i++) {
      byteNums[i] = byteChars.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNums);
    return new Blob([byteArray], { type: mimeType });
  }

async addliketoviode(e:Event,video: any,viodeid:any,postowerid:any,userprofile:any,username:string):Promise<void>{
  const dotElement = document.querySelector(`.dot-blue[data-postid="${viodeid}"]`);
  const dotElement1 = document.querySelector(`.liked-dot[data-postid="${viodeid}"]`);

 
   

  const formData = new FormData();
  formData.append('postid', viodeid.toString());
  formData.append('userid', postowerid.toString());
  formData.append('currentuserid', this.userid.toString());
  formData.append('username', username);
  formData.append('profileimage', userprofile);

  formData.append('commenttext', '.');
  formData.append('notificationtype', 'like');
  formData.append('replytext', ".");


  this.http.post(this.APIURL + 'add_post_like', formData).subscribe({
    next: (response: any) => {
      if (response.message == "no") {

        video.likeCount++;
    
            dotElement?.classList.remove('dot-blue');
            dotElement?.classList.add('liked-dot');
        

      } else {
        video.likeCount--;
        dotElement?.classList.remove('liked-dot');
        dotElement1?.classList.remove('liked-dot');
        dotElement1?.classList.add('dot-blue');
       
        this.http.post(this.APIURL + "send-notification", formData).subscribe({
          next: (response: any) => {
       console.log(response);
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
