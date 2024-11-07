import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ImageLargerComponent } from '../../widgets/image-larger/image-larger.component';
import { ReporttingComponent } from '../../widgets/reportting/reportting.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageLargerComponent, RouterModule,ReporttingComponent,FormsModule],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent implements OnInit {
  @Input() postid: string | null = null;
  @Input() groupornormalpostinput: string | null = null;


  
 
  post: any;
  APIURL = environment.APIURL;
  commentForm: FormGroup;
  replayCommentForm: FormGroup;
  comments: any[] = [];
  likes: number = 0;
  showLargerImage: boolean = false;
  islikedmembereddivvisible:boolean=false;
  commentToBeDeleted: any = null;
  deleteingcommentid: any;
  isthelastcomment: boolean = false;
  isthelastcommentLoaing:boolean=false;
  currentImageIndex: number = 0;
  showImageSlider: boolean = false;
  showreportscreenBool:boolean=false;
  sliderImages: string[] = [];
  fromwhatscreen: string = "";
  editCommentText: string = "";
  editCommentId: string = "";
  groupornormalpost: any;
  userid: string = "";
  checkuseridtoroutecommentscreen: string = "";
  numberofcomments:any;
  comment="comment";
  likedornottext:string = "";
  limit = 20;  
  limitlike = 10;  
  offset = 0; 
  offsetlike = 0; 
  loading = false;
  followButtonText:string = "Follow";
  likedMembers:any[]=[];
  hasMoreMembers = false;
  loadingMoreMembers = false;
  images: any[] = [];
  isSubmitting: boolean = false;
  showEditPopup: boolean = false;

  constructor(private route: ActivatedRoute, private http: HttpClient, private fb: FormBuilder, private router: Router,private cdref: ChangeDetectorRef) {
    this.commentForm = this.fb.group({
      commenttext: ['', [Validators.required]],

    });

    this.replayCommentForm = this.fb.group({
      replaycomment: ['', [Validators.required]],

    });

  }
  ngOnInit(): void {
    if (!this.postid) {
      this.postid = this.route.snapshot.paramMap.get('postid');
    }
    this.groupornormalpost = this.groupornormalpostinput || this.route.snapshot.paramMap.get('type');
    this.fromwhatscreen = this.route.snapshot.paramMap.get('screen')!;
    
    this.getPostData();
    this.getpostlikecount();
    this.userid = localStorage.getItem('wmd') || '';
    this.checkuseridtoroutecommentscreen = this.route.snapshot.paramMap.get('uid') || '';
    this.getpostcommentCount(this.postid);
    this.getComments();
  }
  


 async editComment(commentid: string, commenttext: string): Promise<void> {
    this.editCommentId = commentid;
    this.editCommentText = commenttext;
    this.showEditPopup = true;  // Show the popup
  }

  async updateComment(): Promise<void> {
  //   if (this.editCommentText.trim()) {
     

  //     const formData = new FormData();
  //     formData.append('editCommentId', this.editCommentId);
  //     formData.append('editCommentText', this.editCommentText);

  //     this.http.post(this.APIURL + 'add-post-image', formData).subscribe({
  //       next: (response:any) => {
  //         try {
  //           if (response.message = "added") {
  //             this.editCommentText = "";
               
  //            }
  //         } catch (e) {
  //           alert(e.message);
  //         }
  //       },


 
  //     }
  // }
    
  }


  async getPostData(): Promise<void> {
    const storedPostData = sessionStorage.getItem(`postdata_${this.postid}`);
    
    if (storedPostData) {
      const decryptedData = JSON.parse(atob(storedPostData));
  
      this.post = decryptedData.post;
  
      if (decryptedData.images && decryptedData.images.length > 0) {
        this.images = decryptedData.images;  
      }
  
      if (this.post.posttype === "video") {
        const videoBlob = this.convertBase64ToBlob(this.post.post, 'video/mp4');
        this.post.videoUrl = URL.createObjectURL(videoBlob);
      } else if (this.post.posttype === "audio") {
        const audioBlob = this.convertBase64ToBlobAudio(this.post.post);
        this.post.audioUrl = URL.createObjectURL(audioBlob);
      }
  
      this.getfollowingstatus(this.post.userid);
      return;  
    }
  
    const formData = new FormData();
    formData.append('postid', this.postid!);
  
    const url = this.groupornormalpost === "g" ? `${this.APIURL}get_post_group` : `${this.APIURL}get_post`;
  
    this.http.post<any>(url, formData).subscribe({
      next: (response) => {
        this.post = response;
  
        if (this.post.posttype === "image") {
          const formDataimage = new FormData();
          formDataimage.append('postid', this.postid!);
          const imageUrl = this.groupornormalpost === "g" ? `${this.APIURL}get_images_group` : `${this.APIURL}get_images`;
  
          this.http.post<any>(imageUrl, formDataimage).subscribe({
            next: (imageResponse) => {
              this.images = imageResponse.map((img: any) =>
                this.createBlobUrl(img.image, 'image/jpeg')  
              );
  
              const postDataToStore = {
                post: this.post,
                images: this.images,  
              };
              const encodedPostData = btoa(JSON.stringify(postDataToStore));
              sessionStorage.setItem(`postdata_${this.postid}`, encodedPostData);
            },
            error: (error: HttpErrorResponse) => {
              console.error('Error loading images!', error);
            },
          });
        } else if (this.post.posttype === "video") {
          const videoBlob = this.convertBase64ToBlob(this.post.post, 'video/mp4');
          this.post.videoUrl = URL.createObjectURL(videoBlob);
        } else if (this.post.posttype === "audio") {
          const audioBlob = this.convertBase64ToBlobAudio(this.post.post);
          this.post.audioUrl = URL.createObjectURL(audioBlob);
        }
  
        this.getfollowingstatus(this.post.userid);
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
      },
    });
  }





  


async getfollowingstatus(postowneruserid:any):Promise<void>{
 
  if(this.userid){
    let params = new HttpParams()
    .set('postownerid', postowneruserid.toString())
    .set('userid', this.userid.toString());

  try {
    const response: any = await this.http.get<any>(`${this.APIURL}following-status`, { params }).toPromise();
    if (response.exists) {
      this.followButtonText = "Following";
    } else {
      this.followButtonText = "Follow";


    }

    
  } catch (error) {
    console.error('There was an error!', error);
  }
  }
}


  async iamstartedtofollow(iamfollowinguserid: any): Promise<void> {

    const formData = new FormData();
    formData.append('myuserid', this.userid);
    formData.append('iamfollowinguserid', iamfollowinguserid);



    this.http.post(this.APIURL + 'start-to-follow', formData).subscribe({
      next: (response: any) => {


        this.toggleFollowButtonText();
      },
      error: error => {
        console.error('There was an error!', error);
      }
    });

  }



  async getlikeedmembers(postid: number): Promise<void> {
 
    this.islikedmembereddivvisible = true;  
    this.cdref.detectChanges();
    const formData = new FormData();
    formData.append('postid', postid.toString());
    formData.append('limit', this.limitlike.toString());
    formData.append('offset', this.offsetlike.toString());
    try {
     
    
      if(this.groupornormalpost !="n"){
         
        const response: any = await this.http.post(this.APIURL + 'get_liked_members_group', formData).toPromise();
        const newMembers = response.map((member: any) => ({
          username: member.username,
          profileimage: this.createBlobUrl(member.profileimage, 'image/jpeg')
        }));
        this.likedMembers = [...this.likedMembers, ...newMembers];
        this.limitlike += this.offsetlike;
        this.loadingMoreMembers = false;
        if(this.likedMembers.length >= 10){
          this.hasMoreMembers= true;
        }
      }else{
        
  
        const response: any = await this.http.post(this.APIURL + 'get_liked_members', formData).toPromise();
        const newMembers = response.map((member: any) => ({
          username: member.username,
          profileimage: this.createBlobUrl(member.profileimage, 'image/jpeg')
        }));
        this.likedMembers = [...this.likedMembers, ...newMembers];
        this.limitlike += this.offsetlike;
        this.loadingMoreMembers = false;
        if(this.likedMembers.length >= 10){
          this.hasMoreMembers= true;
        }
      }
      
    } catch (error) {
      console.error('There was an error!', error);
      this.loadingMoreMembers = false;  
    }
  }

  toggleFollowButtonText(): void {
    this.followButtonText = this.followButtonText === 'Follow' ? 'Following' : 'Follow';
  }



  async loadMoreMembers(e:Event): Promise<void> {
    e.preventDefault();
    

    this.loadingMoreMembers = true;

    try {
      const response: any = await this.getlikeedmembers(this.post.postid);
     
      if (response && response.length > 0) {
        const newMembers = response.map((member: any) => ({
          username: member.username,
          profileimage: this.createBlobUrl(member.profileimage, 'image/jpeg')
        }));
        this.likedMembers = [...this.likedMembers, ...newMembers];
        this.offset += this.limit;
      } else {
        this.hasMoreMembers = false;  
      }
    } catch (error) {
      console.error('There was an error!', error);
    } finally {
      this.loadingMoreMembers = false;
    }
  }

  closememebrslikeddiv(e:Event):void{
    e.preventDefault();
    this.islikedmembereddivvisible=false;
  
  }

  async getpostcommentCount(postid: any): Promise<void> {
   
  
    const params = new HttpParams().set('postid', postid.toString());
  
    try {
      const response: any = await this.http.get<any>(`${this.APIURL}get_comments_count`, { params }).toPromise();
  
      if (response.comment_count !== undefined) {
        this.numberofcomments = response.comment_count;
  
      }
    } catch (error) {
      console.error('There was an error!', error);
    }
  }
  

  onImageClick(): void {
    this.showLargerImage = true;

  }


  toggleReplayDiv(comment: any): void {
    comment.showReplayDiv = !comment.showReplayDiv;
    if (comment.showReplayDiv) {
      this.getReplayComments(comment.commentid)
        .then((replayComments: any) => {
          comment.replays = replayComments.replaycomments ?? [];


          if (replayComments.userprofile) {

            comment.userprofileBlobUrl = this.createBlobUrl(replayComments.userprofile, 'image/jpeg');
            console.log(comment.userprofileBlobUrl);
          }


          comment.replays.forEach((replay: any) => {
            if (replay.userprofile) {
              replay.userprofileBlobUrl = this.createBlobUrl(replay.userprofile, 'image/jpeg');
              console.log(replay.userprofileBlobUrl);

            }
          });
        })
        .catch(error => {
          console.error('Error fetching replay comments:', error);
          comment.replays = [];
        });
    }
  }

  async getReplayComments(commentid: any): Promise<any> {
    const params = new HttpParams().set('commentid', commentid.toString());
    try {
      let responsereplaycomment: any;
      if (this.groupornormalpost === "g") {
        responsereplaycomment = await this.http.get<any>(`${this.APIURL}get_replay_comments_group`, { params }).toPromise();
      } else {
        responsereplaycomment = await this.http.get<any>(`${this.APIURL}get_replay_comments`, { params }).toPromise();
      }

      if (responsereplaycomment.userprofile) {
        responsereplaycomment.userprofileBlobUrl = this.createBlobUrl(responsereplaycomment.userprofile, 'image/jpeg');

      }

      if (Array.isArray(responsereplaycomment.replaycomments)) {
        responsereplaycomment.replaycomments.forEach((replay: any) => {
          if (replay.userprofile) {
            replay.userprofileBlobUrl = this.createBlobUrl(replay.userprofile, 'image/jpeg');
            console.log(replay.userprofileBlobUrl);
          }
        });
      }

      this.replayCommentForm.reset();

      return responsereplaycomment || {};
    } catch (error) {
      console.error('Error fetching replay comments:', error);
      return {};
    }
  }



  toggleReplaycommentDropdown(event: MouseEvent, comment: any, replay: any): void {
    event.stopPropagation();
  
    if (!this.comments || !Array.isArray(this.comments)) {
      console.error('Comments are undefined or not an array');
      return;
    }
  
    this.comments.forEach(c => {
      if (!c.replays || !Array.isArray(c.replays)) {
        return;
      }
  
      c.replays.forEach((r: { showDropdownReplay: boolean; }) => {
        if (r !== replay) {
          r.showDropdownReplay = false;
        }
      });
    });
 
    replay.showDropdownReplay = !replay.showDropdownReplay;
  }


  toggleDropdown(event: MouseEvent, comment: any): void {
    event.stopPropagation();
    this.comments.forEach(c => {
      if (c !== comment) {
        c.showDropdown = false;
      }
    });
    comment.showDropdown = !comment.showDropdown;
  }



  onCloseLargerImage(): void {
    this.showLargerImage = false;
  }





  
  async getpostlikecount(): Promise<void> {
    if (this.postid) {

      const params = new HttpParams().set('postid', this.postid.toString());
      const dotElement = document.querySelector(`.dot-blue[data-postid="${this.postid}"]`);


      try {
        if (this.groupornormalpost == "g") {
          const response: any = await this.http.get<any>(`${this.APIURL}get_like_count_group`, { params }).toPromise();

          if (response.like_count !== undefined) {
            this.likes = response.like_count;

            if (this.userid !== '') {
              const paramstocheckuserliked = new HttpParams()
                  .set('postid', this.postid.toString())
                  .set('userid', this.userid.toString());

              const likeCheckResponse: any = await this.http.get<any>(`${this.APIURL}check_curruntuser_liked_or_not_group`, { params: paramstocheckuserliked }).toPromise();
              
              if (likeCheckResponse.message === "yes") {
                  dotElement?.classList.add('liked-dot');
              } else {
                  dotElement?.classList.remove('liked-dot');
              }
          }


          }
        } else {
          const response: any = await this.http.get<any>(`${this.APIURL}get_like_count`, { params }).toPromise();

          if (response.like_count !== undefined) {
            this.likes = response.like_count;

            if (this.userid !== '') {
              const paramstocheckuserliked = new HttpParams()
                  .set('postid', this.postid.toString())
                  .set('userid', this.userid.toString());

               

              const likeCheckResponse: any = await this.http.get<any>(`${this.APIURL}check_curruntuser_liked_or_not`, { params: paramstocheckuserliked }).toPromise();
              
              if (likeCheckResponse.message === "yes") {
                  dotElement?.classList.add('liked-dot');
                
                  this.likedornottext = "yes";
              } else {
                  dotElement?.classList.remove('liked-dot');
               

                  this.likedornottext = "no";

              }
          }


          }
        }
      } catch (error) {
        console.error('There was an error!', error);
      }
    } else {
      console.error('Post object is not initialized or missing postid.');
    }
  }







  async getnumberofreplays(commentid: any): Promise<void> {
    try {
      const params = new HttpParams().set('commentid', commentid.toString());
      const response: any = await this.http.get<any>(`${this.APIURL}get_replay_count`, { params }).toPromise();

      const updatedComments = this.comments.map(comment => {
        if (comment.commentid === commentid) {
          return { ...comment, replayscount: response.replays_count };
        }
        return comment;
      });

      this.comments = updatedComments;

    } catch (error) {
      console.error('Error fetching replay count:', error);
    }
  }


 

  async getComments(loadMore: boolean = false): Promise<void> {
    if (!loadMore) {
      this.offset = 0;
    }
  
    const params = new HttpParams()
      .set('postid', this.postid!.toString())
      .set('limit', '10')
      .set('offset', this.offset.toString());
  
    const url = this.groupornormalpost === "g" 
      ? `${this.APIURL}get_comments_group` 
      : `${this.APIURL}get_comments`;
  
    try {
      // Add any local comments to the current list before making the API call
      const newComments: any[] = this.comments.map((comment: any) => ({
        username: comment.username,
        text: comment.text,
        commenteddate: new Date(comment.commenteddate),
        imageurl: comment.profileimage,
        userid: comment.userid,
        commentid: comment.commentid
      }));
  
      if (!loadMore) {
        // Reset the comments array to include the newly appended comments if not loading more
        this.comments = [...newComments, ...this.comments];
      } else {
        // Append new comments if loading more
        this.comments = [...this.comments, ...newComments];
      }
  
      // Now make the API call
      this.http.get<any>(url, { params }).subscribe({
        next: (response: any) => {
          try {
            if (response && Array.isArray(response.comments)) {
              const newCommentsFromAPI = response.comments.map((comment: any) => ({
                username: comment.username,
                text: comment.text,
                commenteddate: new Date(comment.commenteddate),
                imageurl: comment.profileimage,
                userid: comment.userid,
                commentid: comment.commentid
              }));
  
              this.isthelastcommentLoaing = newCommentsFromAPI.length === 10;
  
              if (loadMore) {
                // Append new comments from API when loading more
                this.comments = [...this.comments, ...newCommentsFromAPI];
              } else {
                // Reset the comments to the new ones from the API
                this.comments = newCommentsFromAPI;
              }
  
              this.offset += 10;
            } else {
              this.comments = [];
              console.log("No comments found or comments is not an array.");
              this.isthelastcommentLoaing = false;
            }
          } catch (err) {
            console.error("Error processing comments:", err);
            this.comments = [];
            this.isthelastcommentLoaing = false;
          }
        },
        error: (error: any) => {
          console.log("Error fetching comments:", error.message);
          if (error.message === "No comments found") {
            console.log('No comments');
          } else if (error.status === "404") {
            console.log('No comments found, 404 error');
          } else {
            console.log('An unexpected error occurred:', error);
          }
        }
      });
    } catch (err) {
      console.error("Error making the request:", err);
      this.comments = [];
      this.isthelastcommentLoaing = false;
    }
  }
  









  









  
  convertBase64ToBlobAudio(base64Data: string): Blob {
    return this.convertBase64ToBlob(base64Data, 'audio/mpeg');
  }

  convertBase64ToBlob(base64: string, mimeType: string): Blob {
    const base64Data = base64.replace(/^data:video\/mp4;base64,/, '');
    const byteChars = atob(base64Data);
    const byteNums = new Array(byteChars.length);

    for (let i = 0; i < byteChars.length; i++) {
      byteNums[i] = byteChars.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNums);
    return new Blob([byteArray], { type: mimeType });
  }



  showImageSliderMethod(images: string[]): void {

    this.currentImageIndex = 0;
    this.showImageSlider = true;
    this.sliderImages = images;
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    } else {
      this.currentImageIndex = this.sliderImages.length - 1;
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.sliderImages.length - 1) {
      this.currentImageIndex++;
    } else {
      this.currentImageIndex = 0;
    }
  }

  closeSlider(): void {
    this.showImageSlider = false;
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












  onSubmit(postid: any, userid: any, username: string, userprofile: any): void {

    this.isSubmitting = true;

    if (this.userid == '') {
      this.router.navigate(['/auth/log-in']);
      return;
    }

    if (this.commentForm.valid) {
      const formData = new FormData();

      Object.keys(this.commentForm.value).forEach(key => {
        formData.append(key, this.commentForm.value[key]);
      });
      const myuserid: string | null = localStorage.getItem('wmd');
      formData.append('postid', postid);
      formData.append('userid', this.userid);
      formData.append('username', username);
      formData.append('userprofile', userprofile);

      if (this.groupornormalpost == "g") {

        this.http.post(this.APIURL + 'add_comment_group', formData).subscribe({
          next: (response: any) => {
            this.getComments();
            this.numberofcomments++;
            this.isSubmitting = false;

            if (userid == this.userid) {
              this.commentForm.reset();

              return;
            } else {
              formData.append('userid', userid);

              formData.append('profileimage', userprofile);
              formData.append('notificationtype', 'comment');
              formData.append('currentuserid', myuserid!);
              formData.append('commenttext', this.commentForm.get('commenttext')?.value);
              formData.append('replytext', ".");



              this.http.post(this.APIURL + "send-notification", formData).subscribe({
                next: (response: any) => {


                  this.commentForm.reset();
                }
              });
            }


            console.log('Comment added successfully:', response);
          },
          error: error => {
            console.error('There was an error!', error);
          }
        });

      } else {
        this.http.post(this.APIURL + 'add_comment', formData).subscribe({
          next: (response: any) => {
            this.getComments();

            this.numberofcomments++;
            this.isSubmitting = false;

        
            if (userid == this.userid) {
              this.commentForm.reset();
              return;
            } else {
            
              formData.append('userid', userid);

              formData.append('profileimage', userprofile);
              formData.append('notificationtype', 'comment');
              formData.append('currentuserid', this.userid);
              formData.append('commenttext', this.commentForm.get('commenttext')?.value);
              formData.append('replytext', ".");

            
                


              this.http.post(this.APIURL + "send-notification", formData).subscribe({
                next: (response: any) => {


                  this.commentForm.reset();
                }
              });
            }


            console.log('Comment added successfully:', response);
          },
          error: error => {
            console.error('There was an error!', error);
          }
        });
      }


    }
  }











  addingreplaycomment(postid: any, userid: any, username: string, userprofile: any, commentid: any, commenttext: string): void {

 

    if (this.userid == '') {
      this.router.navigate(['/auth/log-in']);
      return;
    }

    if (this.replayCommentForm.valid) {

      const formData = new FormData();



      formData.append('postid', postid);
      formData.append('commentid', commentid);
      formData.append('userid', this.userid);
      formData.append('username', username);
      formData.append('userprofile', userprofile);
      formData.append('replytext', this.replayCommentForm.get('replaycomment')!.value);



      if (this.groupornormalpost == "g") {
        this.http.post(this.APIURL + 'add_replay_comment_group', formData).subscribe({
          next: (response: any) => {


            this.getReplayComments(commentid).then((replayComments: any) => {
              const commentToUpdate = this.comments.find((c: any) => c.commentid === commentid);
              if (commentToUpdate) {
                commentToUpdate.replays = replayComments.replaycomments ?? [];
              }
            });

            const commentToUpdate = this.comments.find((c: any) => c.commentid === commentid);
            if (commentToUpdate) {
              commentToUpdate.replayscount = (commentToUpdate.replayscount || 0) + 1;
            }


            if(userid == this.userid){
              this.replayCommentForm.reset();
              return;
            }else{
              const myuserid: string | null = localStorage.getItem('wmd');

              formData.append('profileimage', userprofile);
              formData.append('notificationtype', 'replaycomment');
              formData.append('currentuserid', myuserid!);
              formData.append('commenttext', commenttext);
  
  
              this.http.post(this.APIURL + "send-notification", formData).subscribe({
                next: (response: any) => {
  
                  this.replayCommentForm.reset();
  
                }
              });
            }
           




            console.log('Comment added successfully:', response);
          },
          error: error => {
            console.error('There was an error!', error);
          }
        });
      } else {
        this.http.post(this.APIURL + 'add_replay_comment', formData).subscribe({
          next: (response: any) => {


            this.getReplayComments(commentid).then((replayComments: any) => {
              const commentToUpdate = this.comments.find((c: any) => c.commentid === commentid);
              if (commentToUpdate) {
                commentToUpdate.replays = replayComments.replaycomments ?? [];
              }
            });

            const commentToUpdate = this.comments.find((c: any) => c.commentid === commentid);
            if (commentToUpdate) {
              commentToUpdate.replayscount = (commentToUpdate.replayscount || 0) + 1;
            }


            if(userid == this.userid){
              this.replayCommentForm.reset();
              return;
            }else{
              const myuserid: string | null = localStorage.getItem('wmd');

              formData.append('profileimage', userprofile);
              formData.append('notificationtype', 'replaycomment');
              formData.append('currentuserid', myuserid!);
              formData.append('commenttext', commenttext);
  
  
              this.http.post(this.APIURL + "send-notification", formData).subscribe({
                next: (response: any) => {
  
                  this.replayCommentForm.reset();
  
                }
              });
            }




            console.log('Comment added successfully:', response);
          },
          error: error => {
            console.error('There was an error!', error);
          }
        });
      }
    }
  }



  likePost(postid: number, userid: any, username: string, profileimage: string, normalorgroup: string): void {


    const dotElement = document.querySelector(`.dot-blue[data-postid="${postid}"]`);
    const dotElement1 = document.querySelector(`.liked-dot[data-postid="${postid}"]`);




    if (!this.userid) {
      this.router.navigate(['/auth/log-in']);
      return;
    }
  
    const formData = new FormData();
    formData.append('postid', postid.toString());
    formData.append('userid', userid.toString());
    formData.append('currentuserid', this.userid);
    formData.append('username', username);
    formData.append('commenttext', '.');
    formData.append('notificationtype', 'like');
    formData.append('replytext', ".");
    formData.append('profileimage', profileimage);
  
    const url = normalorgroup === "g" ? 'add_post_like_group' : 'add_post_like';
    this.http.post(`${this.APIURL}${url}`, formData).subscribe({
      next: (response: any) => {
        if (response.message === "no") {
          this.likes++;
          dotElement?.classList.add('liked-dot');
          dotElement1?.classList.remove('liked-dot');
          dotElement1?.classList.add('dot-blue');
        } else {
          this.likes--;
          dotElement?.classList.remove('liked-dot');
          dotElement1?.classList.remove('liked-dot');
          dotElement1?.classList.add('dot-blue');
        }
  
        if(userid == this.userid){
                return;
        }else{
          this.http.post(`${this.APIURL}send-notification`, formData).subscribe({
            next: (response: any) => {
    
            },
            error: error => {
              console.error('Error sending notification', error);
            }
          });
        }
        
      },
      error: error => {
        console.error('Error liking post', error);
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













  confirmDeleteComment(comment: any): void {
    this.commentToBeDeleted = comment;
  }

  cancelDeleteComment(): void {
    this.commentToBeDeleted = false;
  }

  removeComment(comment: any, commentID: any): void {

    this.commentToBeDeleted = true;
    this.deleteingcommentid = commentID;
  }


  
  async removeReplayComment(relaycomment: any, replaycommentID: any): Promise<void> {
    const result = confirm("Do you want to remove this replay?");
    if (result) {
      const formData = new FormData();
      formData.append('commentreplayid', replaycommentID);

      try {
        const response = await this.http.post<any>(`${this.APIURL}remove_replay_comment`, formData).toPromise();

        if (response.message === "deleted") {

          this.comments.forEach(comment => {
            if (comment.replays) {
              comment.replays = comment.replays.filter((replay: any) => replay.commentreplayid !== replaycommentID);
              if (comment.replayscount) {
                comment.replayscount--;
              }
            }
          });

          console.log('Replay comment deleted successfully');
        }
      } catch (error) {
        console.error('Error removing replay comment:', error);
      }
    } else {
      relaycomment.showDropdown = false;

    }
  }


  removeCommentYes(comment: any) {
    const params = new HttpParams().set('commentid', this.deleteingcommentid.toString());

    this.http.get<any>(`${this.APIURL}delete_comment`, { params }).subscribe({
      next: (response: any) => {
        this.numberofcomments --;

        if (this.comments.length == 1) {
          this.isthelastcomment = true;
          this.commentToBeDeleted = false;
          this.comments.length = 0;

          this.getComments();
          return;
        }
        this.isthelastcomment = false;
        this.commentToBeDeleted = false;

        this.getComments();
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
      }
    });


  }


  @HostListener('document:click', ['$event'])
  closeAllDropdowns(event: MouseEvent): void {
    this.comments.forEach(comment => {
      comment.showDropdown = false;
    });
  }


  showreportscreen():void{
    this.showreportscreenBool=true;
 
    }
    closeReportScreen():void{
    this.showreportscreenBool=false;
  
    }

}
