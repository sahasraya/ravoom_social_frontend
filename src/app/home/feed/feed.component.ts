import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { AddPostComponent } from '../../widgets/add-post/add-post.component';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PostComponent } from '../../widgets/post/post.component';
import { NotificationComponent } from '../notification/notification.component';
import { CreateGroupComponent } from '../../widgets/create-group/create-group.component';
import { HeaderComponent } from '../../widgets/header/header.component';


@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
 
    AddPostComponent,
    CommonModule,
    RouterModule,
    PostComponent,
    NotificationComponent,
    CreateGroupComponent,
    HeaderComponent
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css'
})
export class FeedComponent {

  posts: any[] = [];
  openaddpostscreenbool: boolean = false;
  APIURL = "http://127.0.0.1:8000/";
  limit = 5;
  offset = 0;
  loading = false;
  iscreatenewgroupopen: boolean = false;
  userid:string = "";
  postType: string = "";
  user: any;

 

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getPostsFeed();
    this.userid = localStorage.getItem('wmd') || '';
    this.getuserdetails(this.userid);

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

  

  
  createnewgroup():void{
    this.iscreatenewgroupopen = true;
  }
  closecreatenewgroup():void{
    this.iscreatenewgroupopen = false;

  }

  getPostsFeed(): void {
    if (this.loading) return;
 


    this.loading = true;
    this.http.get<any[]>(`${this.APIURL}get_posts_feed?limit=${this.limit}&offset=${this.offset}`).subscribe({
      next: (res) => {
        this.posts = [...this.posts, ...this.processPosts(res)];
        this.offset += this.limit;
        this.loading = false;
        this.cdr.detectChanges();  
   
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.loading = false;
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

  openaddpostscreen(type: string): void {
    this.postType = type;
    this.openaddpostscreenbool = true;
  }

  handlePostDelete(index: number): void {
    this.posts[index].deleted = true;
    this.getPostsFeed();
 
  }

  onPostAdded(): void {
 
    this.offset = 0;
    this.posts = [];
    this.getPostsFeed();  
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const element = document.documentElement;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      localStorage.removeItem('scrollPosition');
      this.getPostsFeed();
    }
  }
}
