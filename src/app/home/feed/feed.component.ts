import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { AddPostComponent } from '../../widgets/add-post/add-post.component';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';
import { PostComponent } from '../../widgets/post/post.component';
import { CreateGroupComponent } from '../../widgets/create-group/create-group.component';
import { HeaderComponent } from '../../widgets/header/header.component';
import { FeedscreenUserListComponent } from '../../widgets/feedscreen-user-list/feedscreen-user-list.component';
import { FeedscreenGroupListComponent } from '../../widgets/feedscreen-group-list/feedscreen-group-list.component';
import { environment } from '../../../environments/environment';
import { NetworkService } from '../../services/network.service';
import { NetworkstatusComponent } from '../../widgets/networkstatus/networkstatus.component';
import { useridexported } from '../../auth/const/const';
import { SkeletonWidgetComponent } from '../../widgets/skeleton-widget/skeleton-widget.component';
import { MainfeedStateService } from '../../services/main-feed.service';


@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
 
    AddPostComponent,
    CommonModule,
    RouterModule,
    PostComponent, 
    CreateGroupComponent,
    HeaderComponent,
    FeedscreenUserListComponent,
    FeedscreenGroupListComponent, 
    NetworkstatusComponent,
    SkeletonWidgetComponent,
    HttpClientModule
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css'
})
export class FeedComponent implements OnInit {

  
  posts: any[] = [];
  openaddpostscreenbool: boolean = false;
  APIURL = environment.APIURL;
  limit = 5;
  limitoption = 5;
  offset=0;
  offsetoption = 0;
  loading:boolean = false;
  loadingoption = false;
  iscreatenewgroupopen: boolean = false;
  showoptionsmenu:boolean=false;  
  userid:string = "";
  postType: string = "";
  user: any;
  selectedOption: string = '';
  username:string = "";
  isOnline: boolean = false;
  isLowConnection: boolean = false;
  networkstatus: string = 'offline';  
  networkstatustext: string = 'You are offline';
  hideNetworkStatus: boolean = false;
  wasOnline: boolean = false;
  postData: any;
  
 

  constructor(private mainfeedStateService: MainfeedStateService,private http: HttpClient, private cdr: ChangeDetectorRef,private router:Router,private networkService: NetworkService) {}

  ngOnInit(): void {
  
    setTimeout(() => {
      const cachedPostsData = this.mainfeedStateService.getState('posts');
      if (cachedPostsData) {
 
        this.posts = cachedPostsData;
        this.processPostsDetails();
      } else {
     
        this.getPostsFeed(); 
      }

      
      this.userid  = useridexported;
      if (this.userid) {
        this.getuserdetails(this.userid);
      }
    }, 1000);

    this.networkService.onlineStatus$.subscribe(status => {
      this.isOnline = status;
      this.updateNetworkStatus(status);
    });

   

  }
 
 
 

  processPostsDetails(): void {
    this.posts = this.posts.map(post => {
      post.formattedDate = new Date(post.timestamp).toLocaleString();

      if (!post.content) {
        post.content = 'No content available';
      }

      this.restoreScrollPosition();

      return post;
    });
  }


  restoreScrollPosition(): void {
    const scrollPosition = localStorage.getItem('scrollPositionMainFeed');
  
  
    if (scrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(scrollPosition, 10));   
      }, 100);
    }
  }

  onOptionSelected(option: string): void {
    this.selectedOption = option;
    this.posts = [];
    this.offsetoption = 0;

   
    this.getPostsFromOption(this.selectedOption);
  
  
    
  }
  
  saveScrollPosition(): void {
    localStorage.setItem('scrollPositionMainFeed', window.scrollY.toString());
  }

  

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    this.saveScrollPosition();
      const element = document.documentElement;
      const scrollPosition = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
  
      if (scrollHeight - scrollPosition <= clientHeight + 3000 && !this.loading) {
        
  
          if (this.selectedOption === "") {
            this.getPostsFeed();  
            this.loading = false;
          } else {
              this.getPostsFromOption(this.selectedOption);  
          }
      }
  }

  async getPostsFeed(): Promise<void> {
    if (this.loading) return;
  
    this.loading = true;
    this.cdr.detectChanges();
  
    this.http.get<any[]>(`${this.APIURL}get_posts_feed?limit=${this.limit}&offset=${this.offset}`).pipe(
      map((res: any[]) => {
        if (res.length > 0) {
          const newPosts = this.filterDuplicatePosts(res);  // Filter out posts that are already loaded
          const processedPosts = this.processPosts(newPosts); // Process new posts
          this.posts = [...this.posts, ...processedPosts]; // Append the new posts to the current posts list
          this.offset += this.limit;
        } else {
          console.log('No more posts to load.');
        }
  
        this.mainfeedStateService.saveState('posts', this.posts);  // Cache the updated list of posts
      }),
      catchError(error => {
        console.error('There was an error!', error);
        return of([]);
      }),
      tap(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe();
  }
  
  // Method to filter out already loaded posts by postid
  private filterDuplicatePosts(posts: any[]): any[] {
    const existingPostIds = new Set(this.posts.map(post => post.postid));  // Create a set of already existing post IDs
    return posts.filter(post => !existingPostIds.has(post.postid)); // Only include posts that are not in the existing set
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
  
  

  
 
  
 private updateNetworkStatus(status: boolean) {
    if (status) {
      if (!this.wasOnline) {
        this.networkstatus = 'online';
        this.networkstatustext = 'You are online';
        this.hideNetworkStatus = false;

        setTimeout(() => {
          this.hideNetworkStatus = true;  
        }, 1000);
      }
      this.wasOnline = true;
    } else {
      this.networkstatus = 'offline';
      this.networkstatustext = 'You are offline';
      this.hideNetworkStatus = false;  
      this.wasOnline = false;
    }
  }

async getuserdetails(userid:string):Promise<void>{
    const formData = new FormData();
    formData.append('userid', userid);

    this.http.post<any>(`${this.APIURL}get_user_details`, formData).subscribe({
      next: (response:any) => {
        
        this.user = response;  
        this.username = this.user.username;
     
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


  toggleOptionsSelecter(e:Event):void{
    e.preventDefault();
    e.stopPropagation();

    this.showoptionsmenu=!this.showoptionsmenu;

  }


 

  async getPostsFromOption(selectedOption: string): Promise<void> {
    if (this.loadingoption) return;

    this.loadingoption = true;

    const formData = new FormData();
    formData.append('selectedOption', selectedOption);
    formData.append('limit', this.limitoption.toString());
    formData.append('offset', this.offsetoption.toString());
  
    this.http.post<any[]>(`${this.APIURL}get_posts_feed_option`, formData).subscribe({
      next: (response: any[]) => {
   
        this.posts = [...this.posts, ...this.processPosts(response)];
 
        this.offsetoption += this.limitoption;
        this.loadingoption = false;
        this.cdr.detectChanges();  
      },
      error: (error: HttpErrorResponse) => {
        this.loadingoption = false;
        console.error('There was an error!', error);
      }
    });
}

  gotovideoslider(e:Event){
    e.preventDefault();
 
    this.router.navigate(['/home/slider']);



  }


  gobackfromviodes(e:Event):void{
    e.preventDefault();
    e.stopPropagation();
    this.posts = [];
    this.offset = 0;
    this.selectedOption = '';
 this.getPostsFeed();
 
   
 
  }

  


 


  openaddpostscreen(type: string): void {
    document.body.style.overflow = 'hidden';
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


 
  
  
}
