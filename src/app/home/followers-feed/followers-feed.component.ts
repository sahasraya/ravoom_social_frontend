import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostComponent } from '../../widgets/post/post.component';
import { FeedscreenGroupListComponent } from '../../widgets/feedscreen-group-list/feedscreen-group-list.component';
import { FeedscreenUserListComponent } from '../../widgets/feedscreen-user-list/feedscreen-user-list.component';
import { UserlistToFollowComponent } from '../userlist-to-follow/userlist-to-follow.component';
import { environment } from '../../../environments/environment';
import { useridexported } from '../../auth/const/const';


@Component({
  selector: 'app-followers-feed',
  standalone: true,
  imports: [CommonModule,RouterModule,PostComponent, FeedscreenGroupListComponent,FeedscreenUserListComponent,UserlistToFollowComponent],
  templateUrl: './followers-feed.component.html',
  styleUrl: './followers-feed.component.css'
})
export class FollowersFeedComponent {



  posts: any[] = [];
  openaddpostscreenbool: boolean = false;
  APIURL = environment.APIURL;
  limit = 5;
  offset = 0;
  loading = false;
  userid: string = "";
  showtheuserlisttofollowBool:boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef,@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.userid = useridexported;
    if (this.userid) {
      this.getFollowersPostsFeed();
    }
     
  }

  getFollowersPostsFeed(): void {
    if (this.loading) return;
  
 
    const url = `${this.APIURL}get_followers_posts_feed?limit=${this.limit}&offset=${this.offset}&myuserid=${this.userid}`;
  
    this.loading = true;
    this.http.get<any[]>(url).subscribe({
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



  showtheuserlisttofollow():void{
   this.showtheuserlisttofollowBool=true;
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

  openaddpostscreen(): void {
    this.openaddpostscreenbool = true;
  }

  handlePostDelete(index: number): void {
    this.posts[index].deleted = true;
    this.getFollowersPostsFeed();
 
  }

  onPostAdded(): void {
    this.offset = 0;
    this.posts = [];
    this.getFollowersPostsFeed();  
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const element = document.documentElement;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      localStorage.removeItem('scrollPosition');

      this.getFollowersPostsFeed();
    }
  }

  
}
