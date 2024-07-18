import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLinkPreviewModule } from 'ngx-link-preview';
import { isPlatformBrowser } from '@angular/common';  
import { PLATFORM_ID } from '@angular/core';
 

@Component({
  selector: 'app-add-post',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgxLinkPreviewModule
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

  selectedColor: string = '';
  linkUrl: string = '';
  
  apiRoute = 'https://opengraph.io/api/1.1/site/:site?app_id=3ec5a83b-4cce-4f5e-8ed7-30f72e7414e7';
          
  appId = '3ec5a83b-4cce-4f5e-8ed7-30f72e7414e7';

  selectedColorElement: HTMLElement | null = null;
  writigtextpost:boolean =false;

  showvideoaudioformbool:boolean =true;
  showtextpostformbool:boolean =false;
  showimagepostsformbool:boolean =false;
  showlinkpostformbool:boolean =false;
  isNoImage: boolean = false;
  
  linkPreviewData: any = null;

  APIURL = 'http://127.0.0.1:8000/';
  @Output() postAdded = new EventEmitter<void>();
  @Output() closePost = new EventEmitter<void>();

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
      img: ['', Validators.required] ,
 
    });

  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
 
      this.userid = localStorage.getItem('wmd') || '';
 
    }


  }
 
  gettignLink(linkUrle:any){
    this.linkUrl = linkUrle;
    console.log(linkUrle);
  }

 

  closeAddPost():void{
    this.closePost.emit();
  }
  
  getPreview(link:any) {

    this.linkUrl =link;
this.getLinkPreview(this.linkUrl);

console.log(this.linkUrl);
     
  }


  getLinkPreview(url: string) {
    const formData = new FormData();
    formData.append('url', url);

    this.http.post<any>(`${this.APIURL}get-preview`, formData).subscribe({
      next: (data) => {
        this.linkPreviewData = data;
        this.isNoImage = this.linkPreviewData.img === '';
        if (this.isNoImage) {
          this.linkPostForm.controls['img'].setValidators([Validators.required]);
        } else {
          this.linkPostForm.controls['img'].clearValidators();
        }
        this.linkPostForm.controls['img'].updateValueAndValidity();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching link preview:', error);
      }
    });
  }



  onSubmitText(): void {
    if (this.textPostForm.valid) {
      const formData = new FormData();

 
      
      if (this.userid) {
  
        formData.append('userid', this.userid);
        formData.append('textPostdescription', this.textPostForm.get('textPostdescription')!.value);
        formData.append('textPostbody', this.textPostForm.get('textPostbody')!.value);
        const colorToAppend = this.selectedColor ? this.selectedColor : '#000a03';
        formData.append('selectedColor', colorToAppend);
  
        this.http.post(this.APIURL + 'add-post-text', formData).subscribe({
          next: response => {
            console.log('Response from server:', response);

            this.postAdded.emit();
            this.closePost.emit();
          },
          error: error => {
            console.error('There was an error posting the data!', error);
          }
        });
      } else {
        console.error('User ID is not available in session storage.');
      }
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
    if (this.addPostForm.valid  ) {
      const formData = new FormData();
      formData.append('uid', this.userid);
      formData.append('postdescription', this.addPostForm.get('postdescription')!.value);
      formData.append('mediafile', this.selectedFile!, this.selectedFile!.name);

      

      this.http.post(this.APIURL + 'add-post', formData).subscribe({
        next: response => {
          console.log(response);
          this.selectedFile = null;
          this.filePreview = null;
          this.selectedFiles = [];
          this.imagePreviews = [];
          this.addPostForm.reset();
          this.postAdded.emit();
          this.closePost.emit();
          

          
        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    }
  }





  onSubmitImag(): void {
    if (this.imagePostForm.valid) {
      const formData = new FormData();
      formData.append('uid', this.userid);
      formData.append('imagePostdescription', this.imagePostForm.get('imagePostdescription')!.value);
  
      this.selectedFiles.forEach(file => {
        formData.append('imagefile', file, file.name);  // Use 'imagefile' to match the FastAPI parameter
      });
  
      this.http.post(this.APIURL + 'add-post-image', formData).subscribe({
        next: response => {
          console.log(response);
          this.selectedFiles = [];
          this.imagePreviews = [];
          this.imagePostForm.reset();
          this.postAdded.emit();
          this.closePost.emit();
        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    }
  }




  onSubmitLink(): void {
    if (this.linkPostForm.valid) {
      const formData = new FormData();
      formData.append('uid', this.userid);
      formData.append('imagePostdescription', this.linkPostForm.get('listPostdescription')!.value);
      formData.append('thelink', this.linkUrl);
      formData.append('linktitle', this.linkPreviewData.title);
      formData.append('linkimage', this.linkPreviewData.img);
  
 
  
      this.http.post(this.APIURL + 'add-post-link', formData).subscribe({
        next: response => {
          console.log(response);
  
          this.linkPostForm.reset();
          this.postAdded.emit();
          this.closePost.emit();
        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    }
  }





  






  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.selectedFile = file;

    // File Preview
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.filePreview = reader.result;
      };
    }
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
