import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-feedscreen-user-list',
  standalone: true,
  imports: [RouterModule,CommonModule,FormsModule],
  templateUrl: './feedscreen-user-list.component.html',
  styleUrl: './feedscreen-user-list.component.css'
})
export class FeedscreenUserListComponent  implements OnInit{


  APIURL = 'http://127.0.0.1:8000/';
 

  @ViewChild('videoHolder') videoHolder!: ElementRef<HTMLDivElement>;
  @ViewChild('linkHolder') linkHolder!: ElementRef<HTMLDivElement>;
  @ViewChild('textHolder') textHolder!: ElementRef<HTMLDivElement>;


  
  userList:any;
  videoList:any[] = [];
  linkList:any[] = [];
  textList:any[] = [];
  userid:string="";
  screen:string="";
  videoUrl:string ="";
  noviodeposts:boolean =false;
  offset = 0;
  offsetlink = 0;
  offsettext = 0;
  limit = 5;
  limitlink = 5;
  limittext = 5;
  isLoading = false;
  isLoadingForLink = false;
  isLoadingForText = false;


  showvideosBool:boolean = false;
  showlinksBool:boolean = false;
  showtextsBool:boolean = false;
  showuserBool:boolean = true;

  private scrollListener!: () => void;
  private scrollListenerForLinks!: () => void;
  private scrollListenerForTexts!: () => void;



  constructor(private http:HttpClient,private router:Router){}

  ngOnInit(): void {

 
      this.userid = localStorage.getItem('wmd') || '';
      if(this.userid !=''){
      
        this.getUserList();
        this.getAllVideoPosts();
        this.getLinksPosts();
        this.getTextsPosts();
      }else{
   

        this.userList=[];
        this.getAllVideoPosts();
        this.getLinksPosts();
        this.getTextsPosts();


      }
 
  }

  ngAfterViewChecked(): void {
    if (this.showvideosBool) {
 
      this.attachScrollListener();
    }

    if (this.showlinksBool) {
 
      this.attachScrollListenerForLinks();
    }

    if (this.showtextsBool) {
 
      this.attachScrollListenerForTexts();
    }


    
  }











  ngOnDestroy(): void {
 
    if (this.videoHolder && this.scrollListener) {
      this.videoHolder.nativeElement.removeEventListener('scroll', this.scrollListener);
    }


    if (this.linkHolder && this.scrollListenerForLinks) {
      this.linkHolder.nativeElement.removeEventListener('scroll', this.scrollListenerForLinks);
    }
    if (this.textHolder && this.scrollListenerForTexts) {
      this.textHolder.nativeElement.removeEventListener('scroll', this.scrollListenerForTexts);
    }






  }

  private attachScrollListener(): void {
    if (this.videoHolder && this.videoHolder.nativeElement) {
  
      if (this.scrollListener) {
        this.videoHolder.nativeElement.removeEventListener('scroll', this.scrollListener);
      }
      this.scrollListener = () => this.onScroll();
      this.videoHolder.nativeElement.addEventListener('scroll', this.scrollListener);
 
    }
  }







  private attachScrollListenerForLinks(): void {
    if (this.linkHolder && this.linkHolder.nativeElement) {
  
      if (this.scrollListenerForLinks) {
        this.linkHolder.nativeElement.removeEventListener('scroll', this.scrollListenerForLinks);
      }
      this.scrollListenerForLinks = () => this.onScrollForLinks();
      this.linkHolder.nativeElement.addEventListener('scroll', this.scrollListenerForLinks);
 
    }
  }





  private attachScrollListenerForTexts(): void {
    if (this.textHolder && this.textHolder.nativeElement) {
  
      if (this.scrollListenerForTexts) {
        this.textHolder.nativeElement.removeEventListener('scroll', this.scrollListenerForTexts);
      }
      this.scrollListenerForTexts = () => this.onScrollForTexts();
      this.textHolder.nativeElement.addEventListener('scroll', this.scrollListenerForTexts);
 
    }
  }










  onScrollForLinks(): void {
    if (!this.linkHolder) {
 
      return;
    }

    const element = this.linkHolder.nativeElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const offsetHeight = element.offsetHeight;

   
    if ((scrollTop + offsetHeight) >= scrollHeight && !this.isLoading) {
      this.getLinksPosts();
    
    }
  }



  onScrollForTexts(): void {
    if (!this.textHolder) {
 
      return;
    }

    const element = this.textHolder.nativeElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const offsetHeight = element.offsetHeight;

   
    if ((scrollTop + offsetHeight) >= scrollHeight && !this.isLoading) {
 
      this.getTextsPosts();
    
    }
  }










 
  onScroll(): void {
    if (!this.videoHolder) {
 
      return;
    }

    const element = this.videoHolder.nativeElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const offsetHeight = element.offsetHeight;

   
    if ((scrollTop + offsetHeight) >= scrollHeight && !this.isLoading) {
      this.getAllVideoPosts();
    
    }
  }









  
 

  navigatetouser(userid:any):void{
 
   

 this.router.navigate([`/home/profile/${userid}`]);
  }



  async getAllVideoPosts(): Promise<void> {
    if (this.isLoading) return;
  
    this.isLoading = true;
    this.http.get<any[]>(`${this.APIURL}get_all_video_posts?limit=${this.limit}&offset=${this.offset}`).subscribe({
      next: (response: any[]) => {
        
        if(response.length === 0){
           this.noviodeposts = true;
        }else{
          this.noviodeposts = false;


          const processedVideos = response.map(video => {
       
            if (video.post) {
              const base64Data = video.post;
              const blob = this.convertBase64ToBlob(base64Data, 'video/mp4');
              video.videoUrl = URL.createObjectURL(blob);
            }
            return video;
          });

          this.videoList = [...this.videoList, ...processedVideos];
          this.offset += this.limit;
          this.isLoading = false;

        }
  
       
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
        this.isLoading = false;
      }
    });
  }



 










  async getLinksPosts(): Promise<void> {
    this.isLoadingForLink = true;   

    this.http.get<any[]>(`${this.APIURL}get_all_link_posts?limit=${this.limitlink}&offset=${this.offsetlink}`).subscribe({
      next: (response: any[]) => {
        const processedLinks = response.map(link => {
    
     
            link.textbody = link.textbody;   
              return link;
        });

        processedLinks.forEach(link => {
          if (!this.linkList.some(existingLink => existingLink.postid === link.postid)) {
              this.linkList.push(link);
          }
      });

  
      if (processedLinks.length > 0) {
          this.offsetlink += this.limitlink;
      }

        

        this.linkList = [...this.linkList, ...processedLinks];   
        this.offset += this.limit;    
        this.isLoadingForLink = false; 
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
        this.isLoadingForLink = false;   
      }
    });
  }
 
















  async getTextsPosts(): Promise<void> {
    if (this.isLoadingForText) return;
  
    this.isLoadingForText = true;
  
    this.http.get<any[]>(`${this.APIURL}get_all_text_posts?limit=${this.limittext}&offset=${this.offsettext}`).subscribe({
      next: (response: any[]) => {
        const processedLinks = response.map(text => {
          text.textbody = text.textbody;
          text.textcolor = text.textcolor;
          text.n_or_g = text.n_or_g;
          text.postid = text.postid;
          return text;
        });
  
      
        processedLinks.forEach(text => {
          if (!this.textList.some(existingLink => existingLink.posteddate === text.posteddate)) {
            this.textList.push(text);
          }
        });
  
   
        if (processedLinks.length > 0) {
          this.offsettext += this.limittext;
        }
  
        this.isLoadingForText = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
        this.isLoadingForText = false;
      }
    });
  }






  commentOnPost(event: MouseEvent, postid: any, n_or_g: any): void {
    event.preventDefault();

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
 
    localStorage.setItem('scrollPosition', scrollPosition.toString());


    this.screen = "home";
    this.router.navigate([`/home/comment/${postid}/${n_or_g}/${this.screen}/`]);
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









  async getUserList(): Promise<void> {
    const formData = new FormData();
    formData.append('currentuserid', this.userid);
 

    this.http.post<any>(`${this.APIURL}get_userlist`, formData).subscribe({
      next: (response: any[]) => {
        this.userList = response;

 
        this.userList.forEach((user: any) => {
          if (user.profileimage) {
            user.profileimageUrl = this.createBlobUrl(user.profileimage, 'image/jpeg');
          }
        });
        console.log(this.userList);  // Log the user details
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
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


  


  showvideos(e:Event):void{
    e.preventDefault();
    e.stopPropagation();

   this.showvideosBool=true;
   this.showuserBool= false;
   this.showlinksBool= false;
   this.showtextsBool= false;
 
  }

  showlinks(e:Event):void{
    e.preventDefault();
    e.stopPropagation();

   this.showvideosBool=false;
   this.showuserBool= false;
   this.showlinksBool= true;
   this.showtextsBool= false;
 
  }


  showtexts(e:Event):void{
    e.preventDefault();
    e.stopPropagation();

   this.showvideosBool=false;
   this.showuserBool= false;
   this.showlinksBool= false;
   this.showtextsBool= true;
  }




  gobackfromviodes(e:Event):void{
    e.preventDefault();
    e.stopPropagation();

   this.showvideosBool=false;
   this.showlinksBool= false;
   this.showtextsBool= false;
   this.showuserBool= true;
   
 
  }

  gotovideoslider(e:Event){
    e.preventDefault();
 
    this.router.navigate(['/home/slider']);



  }


}
