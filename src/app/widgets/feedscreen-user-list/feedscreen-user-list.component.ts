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
  @ViewChild('imageHolder') imageHolder!: ElementRef<HTMLDivElement>;
  @ViewChild('voiceHolder') voiceHolder!: ElementRef<HTMLDivElement>;


  
  userList:any;
  videoList:any[] = [];
  linkList:any[] = [];
  textList:any[] = [];
  imageList:any[] = [];
  voiceList:any[] = [];
  userid:string="";
  screen:string="";
  videoUrl:string ="";
  noviodeposts:boolean =false;
  offset = 0;
  offsetlink = 0;
  offsettext = 0;
  offsetvoice = 0;
  offsetimage = 0;
  limit = 5;
  limitlink = 5;
  limittext = 5;
  limitvoice = 5;
  limitimage = 5;
  isLoading = false;
  isLoadingForLink = false;
  isLoadingForText = false;
  isLoadingForImage = false;
  isLoadingForVoice = false;


  showvideosBool:boolean = false;
  showlinksBool:boolean = false;
  showtextsBool:boolean = false;
  showuserBool:boolean = false;
  showimagesBool:boolean = false;
  showvoicesBool:boolean = false;

  private scrollListener!: () => void;
  private scrollListenerForLinks!: () => void;
  private scrollListenerForTexts!: () => void;
  private scrollListenerForImages!: () => void;
  private scrollListenerForVoices!: () => void;



  constructor(private http:HttpClient,private router:Router){}

  ngOnInit(): void {

 
      this.userid = localStorage.getItem('wmd') || '';
      if(this.userid !=''){
      
        this.getUserList();
        this.getAllVideoPosts();
        this.getLinksPosts();
        this.getTextsPosts();
        this.getImagesPosts();
        this.getVoicesPosts();
      }else{
   

        this.userList=[];
        this.getAllVideoPosts();
        this.getLinksPosts();
        this.getTextsPosts();
        this.getImagesPosts();
        this.getVoicesPosts();




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

    if (this.showimagesBool) {
 
      this.attachScrollListenerForImages();
    }


    if (this.showvoicesBool) {
 
      this.attachScrollListenerForVoices();
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


    if (this.textHolder && this.scrollListenerForVoices) {
      this.textHolder.nativeElement.removeEventListener('scroll', this.scrollListenerForVoices);
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


  private attachScrollListenerForImages(): void {
    if (this.imageHolder && this.imageHolder.nativeElement) {
  
      if (this.scrollListenerForImages) {
        this.imageHolder.nativeElement.removeEventListener('scroll', this.scrollListenerForImages);
      }
      this.scrollListenerForImages = () => this.onScrollForImages();
      this.imageHolder.nativeElement.addEventListener('scroll', this.scrollListenerForImages);
 
    }
  }


  private attachScrollListenerForVoices(): void {
    if (this.voiceHolder && this.voiceHolder.nativeElement) {
  
      if (this.scrollListenerForVoices) {
        this.voiceHolder.nativeElement.removeEventListener('scroll', this.scrollListenerForVoices);
      }
      this.scrollListenerForVoices = () => this.onScrollForVoices();
      this.voiceHolder.nativeElement.addEventListener('scroll', this.scrollListenerForVoices);
 
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

   
    if ((scrollTop + offsetHeight) >= scrollHeight && !this.isLoadingForText) {
 
      this.getTextsPosts();
    
    }
  }




  onScrollForImages(): void {
    if (!this.imageHolder) {
 
      return;
    }

    const element = this.imageHolder.nativeElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const offsetHeight = element.offsetHeight;

   
    if ((scrollTop + offsetHeight) >= scrollHeight && !this.isLoadingForImage) {
  
 
      this.getImagesPosts();
    
    }
  }



  onScrollForVoices(): void {
    if (!this.voiceHolder) {
 
      return;
    }

    const element = this.voiceHolder.nativeElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const offsetHeight = element.offsetHeight;

   
    if ((scrollTop + offsetHeight) >= scrollHeight && !this.isLoadingForVoice) {
 
 
      this.getVoicesPosts();
    
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
    if (this.isLoadingForLink) return;

    this.isLoadingForLink = true;

    this.http.get<any[]>(`${this.APIURL}get_all_link_posts?limit=${this.limitlink}&offset=${this.offsetlink}`).subscribe({
        next: (response: any[]) => {
            const processedLinks = response.map(link => {
                link.textbody = link.textbody;
                link.posteddate = link.posteddate;
                link.postid = link.postid;
                link.n_or_g = link.n_or_g;
                link.username = link.username;
                link.onlinestatus = link.onlinestatus;

                if (link.profileimage) {
                  link.profileimage = this.createBlobUrl(link.profileimage, 'image/jpeg');
                }


                return link;
            });

            const newLinks = processedLinks.filter(link => 
                !this.linkList.some(existingLink => existingLink.postid === link.postid)
            );

            this.linkList = [...this.linkList, ...newLinks];
         

            if (newLinks.length > 0) {
                this.offsetlink += this.limitlink;
            }

            this.isLoadingForLink = false;
        },
        error: (error: HttpErrorResponse) => {
            console.error('There was an error!', error);
            this.isLoadingForLink = false;
        }
    });
}














async getImagesPosts(): Promise<void> {
  if (this.isLoadingForImage) return;

  this.isLoadingForImage = true;

  this.http.get<any[]>(`${this.APIURL}get_all_image_posts?limit=${this.limitimage}&offset=${this.offsetimage}`).subscribe({
    next: (response: any[]) => {
      const processedLinks = response.map(image => {
      
        image.n_or_g = image.n_or_g;
        image.postid = image.postid;
        image.username = image.username;
        image.posteddate = image.posteddate;
        image.onlinestatus = image.onlinestatus;
        if (image.profileimage) {
          image.profileimage = this.createBlobUrl(image.profileimage, 'image/jpeg');
        }
        if (image.post) {

          image.post = this.createBlobUrl(image.post, 'image/jpeg');
       
        }

        return image;
      });

    
      processedLinks.forEach(text => {
        if (!this.imageList.some(existingLink => existingLink.postid === text.postid)) {
          this.imageList.push(text);
        }
      });

   

 
      if (processedLinks.length > 0) {
        this.offsetimage += this.limitimage;
      }

      this.isLoadingForImage = false;
    },
    error: (error: HttpErrorResponse) => {
      console.error('There was an error!', error);
      this.isLoadingForImage = false;
    }
  });
}


















async getVoicesPosts(): Promise<void> {
  if (this.isLoadingForVoice) return;

  this.isLoadingForVoice = true;

  this.http.get<any[]>(`${this.APIURL}get_all_voice_posts?limit=${this.limitvoice}&offset=${this.offsetvoice}`).subscribe({
    next: (response: any[]) => {
      const processedLinks = response.map(voice => {
      
        voice.n_or_g = voice.n_or_g;
        voice.postid = voice.postid;
        voice.username = voice.username;
        voice.posteddate = voice.posteddate;
        voice.onlinestatus = voice.onlinestatus;
 
        if (voice.profileimage) {
          voice.profileimage = this.createBlobUrl(voice.profileimage, 'image/jpeg');
        }
        if (voice.post) {

          const base64Data = voice.post;

           const blob = this.convertBase64ToBlobAudio(base64Data);
           voice.audioUrl = URL.createObjectURL(blob);
      
      
       
        }

        return voice;
      });

    
      processedLinks.forEach(voice => {
        if (!this.voiceList.some(existingLink => existingLink.postid === voice.postid)) {
          this.voiceList.push(voice);
        }
      });

   

 
      if (processedLinks.length > 0) {
        this.offsetvoice += this.limitvoice;
      }

      this.isLoadingForVoice = false;
    },
    error: (error: HttpErrorResponse) => {
      console.error('There was an error!', error);
      this.isLoadingForVoice = false;
    }
  });
}





convertBase64ToBlobAudio(base64Data: string): Blob {
  return this.convertBase64ToBlob(base64Data, 'audio/mpeg');
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
          text.username = text.username;
          text.posteddate = text.posteddate;
          text.onlinestatus = text.onlinestatus;
          if (text.profileimage) {
            text.profileimage = this.createBlobUrl(text.profileimage, 'image/jpeg');
          }
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
   this.showimagesBool= false;
   this.showvoicesBool= false;
 
  }

  showlinks(e:Event):void{
    e.preventDefault();
    e.stopPropagation();

   this.showvideosBool=false;
   this.showuserBool= false;
   this.showlinksBool= true;
   this.showtextsBool= false;
   this.showimagesBool= false;
   this.showvoicesBool= false;
 
  }


  showtexts(e:Event):void{
    e.preventDefault();
    e.stopPropagation();

   this.showvideosBool=false;
   this.showuserBool= false;
   this.showlinksBool= false;
   this.showtextsBool= true;
   this.showimagesBool= false;
   this.showvoicesBool= false;
  }




  showimages(e:Event):void{
    e.preventDefault();
    e.stopPropagation();

   this.showvideosBool=false;
   this.showuserBool= false;
   this.showlinksBool= false;
   this.showtextsBool= false;
   this.showimagesBool= true;
   this.showvoicesBool= false;
  }

  
  showvoices(e:Event):void{
    e.preventDefault();
    e.stopPropagation();

   this.showvideosBool=false;
   this.showuserBool= false;
   this.showlinksBool= false;
   this.showtextsBool= false;
   this.showimagesBool= false;
   this.showvoicesBool= true;
  }


  gobackfromviodes(e:Event):void{
    e.preventDefault();
    e.stopPropagation();

   this.showvideosBool=false;
   this.showlinksBool= false;
   this.showtextsBool= false;
   this.showimagesBool= false;
   this.showvoicesBool= false;
   this.showuserBool= true;
   
 
  }

  gotovideoslider(e:Event){
    e.preventDefault();
 
    this.router.navigate(['/home/slider']);



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
