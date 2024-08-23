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


  
  userList:any;
  videoList:any[] = [];
  userid:string="";
  videoUrl:string ="";
  offset = 0;
  limit = 5;
  isLoading = false;


  showvideosBool:boolean = false;
  showuserBool:boolean = true;

  private scrollListener!: () => void;



  constructor(private http:HttpClient,private router:Router){}

  ngOnInit(): void {

 
      this.userid = localStorage.getItem('wmd') || '';
      if(this.userid !=''){
      
        this.getUserList();
        this.getAllVideoPosts();
      }else{
   

        this.userList=[];
        this.getAllVideoPosts();
      }
 
  }

  ngAfterViewChecked(): void {
    if (this.showvideosBool) {
 
      this.attachScrollListener();
    }
  }

  ngOnDestroy(): void {
 
    if (this.videoHolder && this.scrollListener) {
      this.videoHolder.nativeElement.removeEventListener('scroll', this.scrollListener);
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
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
        this.isLoading = false;
      }
    });
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
 
  }

  gobackfromviodes(e:Event):void{
    e.preventDefault();
    e.stopPropagation();

   this.showvideosBool=false;
   this.showuserBool= true;
 
  }

  gotovideoslider(e:Event){
    e.preventDefault();
 
    this.router.navigate(['/home/slider']);



  }


}
