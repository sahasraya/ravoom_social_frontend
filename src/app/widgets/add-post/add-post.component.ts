import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import {  RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
 
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PreLoaderComponent } from '../pre-loader/pre-loader.component';
import { useridexported } from '../../auth/const/const';
import { QuillModule } from 'ngx-quill';
 

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [
    CommonModule, 
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule, 
    PreLoaderComponent, 

  ],
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.css'
})
export class AddPostComponent {
  addPostForm: FormGroup;
  imagePostForm: FormGroup;
  textPostForm: FormGroup;
  linkPostForm: FormGroup;
  userid: string = "";
  selectedFile: File | null = null;   
  filePreview: string | ArrayBuffer | null = null;
  imagePreviews: string[] = [];
  selectedFiles: File[] = [];
  durationError: boolean = false;
  mediaDuration: number | null = null;
  selectedColor: string = '';
  linkUrl: string = '';
  isuploadingthepost:boolean = false;

  
  apiRoute = 'https://opengraph.io/api/1.1/site/:site?app_id=3ec5a83b-4cce-4f5e-8ed7-30f72e7414e7';
          
  appId = '3ec5a83b-4cce-4f5e-8ed7-30f72e7414e7';

  selectedColorElement: HTMLElement | null = null;
  writigtextpost:boolean =false;

  showvideoaudioformbool:boolean =true;
  showtextpostformbool:boolean =false;
  showimagepostsformbool:boolean =false;
  showlinkpostformbool:boolean =false;
  isNoImage: boolean = false;
  previewisloading: boolean = false;
  
  linkPreviewData: any = null;

  APIURL = environment.APIURL;
  @Input() postType: string = '';
  @Output() postAdded = new EventEmitter<void>();
  @Output() closePost = new EventEmitter<void>();


  public isBrowser = false;
 
 


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
    
    
  ) {
    this.addPostForm = this.fb.group({
      postdescription: ['', Validators.required],
      mediafile: [null, Validators.required],
    });


    this.imagePostForm = this.fb.group({
      imagePostdescription: ['', Validators.required],
      imagefile: [null, Validators.required],
    });


    this.textPostForm = this.fb.group({
      textPostdescription: ['', Validators.required],
      textPostbody: ['', Validators.required],
    });


    this.linkPostForm = this.fb.group({
      listPostdescription: ['', Validators.required] ,
      linkrul: ['', Validators.required] ,
   
 
    });

  }

  ngOnInit(): void {
    this.checkposttype(this.postType);
    this.userid = useridexported;
 
 

  }

 
 











  checkposttype(postType:string):void{

    if(postType =="v" || postType == "a"){
      this.showvideoaudioformbool =true;
      this.showtextpostformbool =false;
      this.showimagepostsformbool =false;
      this.showlinkpostformbool = false;
    }else if(postType =="i"){
      this.showvideoaudioformbool =false;
      this.showtextpostformbool =false;
      this.showimagepostsformbool =true;
      this.showlinkpostformbool = false;
    }else if(postType == "t"){
      this.showvideoaudioformbool =false;
      this.showtextpostformbool =true;
      this.showimagepostsformbool =false;
      this.showlinkpostformbool = false;
    }else if(postType =="l"){
      this.showvideoaudioformbool =false;
      this.showtextpostformbool =false;
      this.showimagepostsformbool =false;
      this.showlinkpostformbool = true;
    }

  }



  gettignLink(linkUrle:any){
    this.linkUrl = linkUrle;
    console.log(linkUrle);
  }

 

  closeAddPost():void{
    this.closePost.emit();
    this.mackingtheoverflowcorrect();
  }
  
  mackingtheoverflowcorrect(): void{
    document.body.style.overflow = ''; 
  }


  async getPreview(link:any) {

    this.linkUrl = link;
    this.previewisloading = true;
    await  this.getLinkPreview(this.linkUrl);
 
     
  }



 
  async getLinkPreview(url: string): Promise<void> {
    const formData = new FormData();
    formData.append('url', url);
  
    this.http.post<any>(`${this.APIURL}get-preview`, formData).subscribe({
      next: (data) => {
        this.linkPreviewData = data;
        this.previewisloading = false;
  
  
        if (this.linkPreviewData.img) {
          this.isNoImage = false;
        } else {
          this.isNoImage = true;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.previewisloading = false;
        console.error('Error fetching link preview:', error);
      }
    });
  }



  onSubmitText(): void {
    if (this.textPostForm.valid) {
      const formData = new FormData();
      this.mackingtheoverflowcorrect();

      const token = localStorage.getItem('jwt');
      if(!token){
        alert("Unauthorized access. Please check your credentials.");
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      
    
  
        formData.append('userid', this.userid);
        formData.append('textPostdescription', this.textPostForm.get('textPostdescription')!.value);
        formData.append('textPostbody', this.textPostForm.get('textPostbody')!.value);
        const colorToAppend = this.selectedColor ? this.selectedColor : '#000a03';
        formData.append('selectedColor', colorToAppend);
  
        this.http.post(this.APIURL + 'add-post-text', formData,{headers}).subscribe({
          next: response => {
            console.log('Response from server:', response);

            this.postAdded.emit();
            this.closePost.emit();
          },
          error: error => {
            if (error.status === 401) {
        
              alert("Unauthorized access. Please check your credentials.");
    
            }
            
            console.error('There was an error posting the data!', error);
          }
        });
      
    }
  }

  autoResize(textarea: HTMLTextAreaElement): void {
    if (textarea.value.trim() !== "") {
      this.writigtextpost = true;  
    } else {
      this.writigtextpost = false;  
    }
    textarea.style.height = 'auto';  
    textarea.style.height = `${textarea.scrollHeight}px`; 
  }

  selectColor(color: string, event: MouseEvent): void {
    this.selectedColor = color;

    if (this.selectedColorElement) {
      this.selectedColorElement.classList.remove('selected');
    }

    const target = event.target as HTMLElement;
    target.classList.add('selected');
    this.selectedColorElement = target;

    const previewDiv = document.querySelector('.inner-preview') as HTMLElement;
    if (previewDiv) {
      previewDiv.style.backgroundColor = color;
    }
  }


  onSubmit(): void {
    if (this.addPostForm.valid) {
      this.mackingtheoverflowcorrect();
      this.isuploadingthepost=true;
      const token = localStorage.getItem('jwt');
      if(!token){
        alert("Unauthorized access. Please check your credentials.");
        this.isuploadingthepost=false;
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      


      const formData = new FormData();
      formData.append('uid', this.userid);
      formData.append('postdescription', this.addPostForm.get('postdescription')!.value);
      formData.append('mediafile', this.selectedFile!, this.selectedFile!.name);

      

      this.http.post(this.APIURL + 'add-post', formData,{headers}).subscribe({
        next: response => {
          this.isuploadingthepost=false;
          this.selectedFile = null;
          this.filePreview = null;
          this.selectedFiles = [];
          this.imagePreviews = [];
          this.addPostForm.reset();
          this.postAdded.emit();
          this.closePost.emit();
          

          
        },
        error: error => {
          this.isuploadingthepost=false;
          if (error.status === 401) {
        
            alert("Unauthorized access. Please check your credentials.");
  
          }

          console.error('There was an error!', error);
        }
      });
    }
  }





  onSubmitImag(): void {
    if (this.imagePostForm.valid) {
      this.mackingtheoverflowcorrect();
      const token = localStorage.getItem('jwt');
      if(!token){
        alert("Unauthorized access. Please check your credentials.");
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });





      const formData = new FormData();
      formData.append('uid', this.userid);
      formData.append('imagePostdescription', this.imagePostForm.get('imagePostdescription')!.value);
  
      this.selectedFiles.forEach(file => {
        formData.append('imagefile', file, file.name);   
      });

 
  
      this.http.post(this.APIURL + 'add-post-image', formData,{headers}).subscribe({
        next: response => {
          console.log(response);
          this.selectedFiles = [];
          this.imagePreviews = [];
          this.imagePostForm.reset();
          this.postAdded.emit();
          this.closePost.emit();
        },
        error: error => {
          if (error.status === 401) {
            alert("Unauthorized access. Please check your credentials.");
  
          }

          console.error('There was an error!', error);
        }
      });
    }
  }




  onSubmitLink(): void {
    if (this.linkPostForm.valid) {
      this.mackingtheoverflowcorrect();
      const token = localStorage.getItem('jwt');
      if(!token){
        alert("Unauthorized access. Please check your credentials.");
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });



      const formData = new FormData();
      formData.append('uid', this.userid);
      formData.append('imagePostdescription', this.linkPostForm.get('listPostdescription')!.value);
      formData.append('thelink', this.linkUrl);
      formData.append('linktitle', this.linkPreviewData.title);
      if (this.linkPreviewData.img) {
        formData.append('linkimage', this.linkPreviewData.img);
    } else {
        formData.append('linkimage', '');  
    }
  
 
    
  
      this.http.post(this.APIURL + 'add-post-link', formData,{headers}).subscribe({
        next: response => {
 
  
          this.linkPostForm.reset();
          this.postAdded.emit();
          this.closePost.emit();
        },
        error: error => {
          if (error.status === 401) {
            alert("Unauthorized access. Please check your credentials.");
  
          }
          
          console.error('There was an error!', error);
        }
      });
    }
  }





  





  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.selectedFile = file;

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.filePreview = reader.result;
        this.getMediaDuration(file);
      };
    }
  }

  getMediaDuration(file: File): void {
    const mediaElement = document.createElement(file.type.startsWith('video') ? 'video' : 'audio');
    mediaElement.src = URL.createObjectURL(file);

    mediaElement.onloadedmetadata = () => {
      this.mediaDuration = mediaElement.duration;
      this.durationError = this.mediaDuration > 30;
      URL.revokeObjectURL(mediaElement.src);  
    };
  }

   removeSelectedFile(): void {
    this.selectedFile = null;
    this.filePreview = null;
    this.addPostForm.get('mediafile')?.reset();
  }


  onImageFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.selectedFiles = Array.from(files);  

 
    this.imagePreviews = [];

    for (let file of this.selectedFiles) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };
    }
  }


  removeImagePreview(preview: string): void {
    const index = this.imagePreviews.indexOf(preview);
    if (index > -1) {
      this.imagePreviews.splice(index, 1);
      this.selectedFiles.splice(index, 1);
    }
  }


  


 
  

  showvideoaudioform():void{
    this.showvideoaudioformbool =true;
    this.showtextpostformbool =false;
    this.showimagepostsformbool =false;
    this.showlinkpostformbool = false;
  }


  showimagepostsform():void{
    this.showvideoaudioformbool =false;
    this.showtextpostformbool =false;
    this.showimagepostsformbool =true;
    this.showlinkpostformbool = false;

  }

  showtextpostform():void{
    this.showvideoaudioformbool =false;
    this.showtextpostformbool =true;
    this.showimagepostsformbool =false;
    this.showlinkpostformbool = false;

  }

  showlinkpostform():void{
    this.showvideoaudioformbool =false;
    this.showtextpostformbool =false;
    this.showimagepostsformbool =false;
    this.showlinkpostformbool = true;
  }



}
