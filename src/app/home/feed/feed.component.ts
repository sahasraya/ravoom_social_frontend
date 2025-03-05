import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
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
import { MainfeedSelectedStateService } from '../../services/main-feed-selected.service';
import { QuillModule } from 'ngx-quill';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { getLinkPreview } from 'link-preview-js';


interface PreviewData {
  title?: string;
  description?: string;
  url?: string;
  image?: string[];
  mediaType?: string;
  contentType?: string;
  favicons?: string[];
}

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
    HttpClientModule,
    QuillModule,
    FormsModule,
    ReactiveFormsModule
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
  nomorepoststoload: boolean = false;
  textPostForm: FormGroup;
  linkPreviewData: PreviewData | null = null;
  private apiKey: string = '8adf6215c4be65c5494082faa9421fb0'; 

  constructor(private fb: FormBuilder,private mainfeedSelectedStateService: MainfeedSelectedStateService, private mainfeedStateService: MainfeedStateService, private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router, private networkService: NetworkService) {
    this.textPostForm = this.fb.group({
      textPostdescription: ['', Validators.required],
      textPostbody: ['', Validators.required],
    });
  }

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


  fetchLinkPreviewUrl(event: Event): void {
    const input = event.target as HTMLInputElement;
    const url = input.value.trim();

    if (!url) {
      console.warn('URL is empty');
      return;
    }

    const proxyUrl = `https://api.linkpreview.net?key=${this.apiKey}&q=${encodeURIComponent(url)}`;

    this.http.get(proxyUrl).subscribe({
      next: (data: any) => {
        this.linkPreviewData = data;
        console.log(this.linkPreviewData);
      },
      error: (error) => {
        console.error('Error fetching link preview', error);
      },
    });
  }

  


  
  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],        // toggled buttons
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, false] }],
      [{ 'align': [] }],
      ['link', 'image']
    ]
  };


  onContentChanged(event: any): void {
    const text = event.text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matchedUrls = text.match(urlRegex);

    if (matchedUrls && matchedUrls.length > 0) {
      const latestUrl = matchedUrls[matchedUrls.length - 1];
      this.fetchLinkPreview(latestUrl);
    }
  }

fetchLinkPreview(url: string): void {
  const proxyUrl = `http://localhost:8000/get_link_preview?url=${encodeURIComponent(url)}`;

  this.http.get(proxyUrl).subscribe({
    next: (data: PreviewData) => {
      this.linkPreviewData = data;
      console.log(this.linkPreviewData);
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error('Error fetching link preview', error);
    }
  });
}




  onPostRemoved(postId: number): void {
    const postIndex = this.posts.findIndex(post => post.postid === postId);
    if (postIndex !== -1) {
      this.posts.splice(postIndex, 1);   
    }
  }


  
  async getPostsFeed(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    this.cdr.detectChanges();
  
    let url = `${this.APIURL}get_posts_feed?limit=${this.limit}&offset=${this.offset}`;
  
    if (useridexported) {
      url += `&useridexported=${useridexported}`;
    }
  
    this.http.get<any[]>(url).pipe(
      map((res: any[]) => {
        if (res.length > 0) {
          const newPosts = this.filterDuplicatePosts(res);
          const processedPosts = this.processPosts(newPosts);
          const sortedPosts = this.sortPostsByTime(processedPosts);
  
          this.posts = [...this.posts, ...sortedPosts];
  
          this.offset += this.limit;
  
          this.nomorepoststoload = false;
        } else {
          this.nomorepoststoload = true;
          console.log('No more posts to load.');
        }
  
        this.mainfeedStateService.saveState('posts', this.posts);
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
  
 

 


  restoreScrollPosition(): void {
    const scrollPosition = localStorage.getItem('scrollPositionMainFeed');
   
  
  
    if (scrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(scrollPosition, 10));   
      }, 100);
    }
  }

  











  saveScrollPosition(): void {
    
    localStorage.setItem('scrollPositionMainFeed', window.scrollY.toString());
  }
  
 


  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const element = document.documentElement;
    const scrollPosition = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
  
    if (scrollHeight - scrollPosition <= clientHeight + 1000 && !this.loading && !this.nomorepoststoload) {
      this.saveScrollPosition();
  
      if (this.selectedOption === "") {
        this.getPostsFeed();
      } else {
        this.getPostsFromOption(this.selectedOption);  
      }
    }
  }
  


  
  private sortPostsByTime(posts: any[]): any[] {
    const currentTime = new Date();
  
    return posts.sort((a, b) => {
      const aPostedDate = new Date(a.posteddate);
      const bPostedDate = new Date(b.posteddate);
  
      const aTimeDiff = (currentTime.getTime() - aPostedDate.getTime()) / (1000 * 60);
      const bTimeDiff = (currentTime.getTime() - bPostedDate.getTime()) / (1000 * 60);
  
      const aIsNew = aTimeDiff <= 10;
      const bIsNew = bTimeDiff <= 10;
  
      if (aIsNew && !bIsNew) return -1;   
      if (!aIsNew && bIsNew) return 1;   
  
      return 0;   
    });
  }
  private filterDuplicatePosts(posts: any[]): any[] {
    const existingPostIds = new Set(this.posts.map(post => post.postid));  
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


 
  onOptionSelected(option: string): void {
    this.selectedOption = option;
    this.posts = [];
    this.offsetoption = 0;

    const cachedPostsData = this.mainfeedSelectedStateService.getState(`posts_${option}`);
    if (cachedPostsData) {
        this.posts = cachedPostsData;
        this.processPostsDetails();
    } else {
        this.getPostsFromOption(this.selectedOption);
    }
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
        this.mainfeedSelectedStateService.saveState(`posts_${selectedOption}`, this.posts);
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


 