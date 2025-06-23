import { Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {  RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PreLoaderComponent } from '../pre-loader/pre-loader.component';
import { useridexported } from '../../auth/const/const';
import { firstValueFrom } from 'rxjs';
import { EditorModule } from '@tinymce/tinymce-angular';
import { getLinkPreview } from 'link-preview-js';
import { Editor, RawEditorOptions } from 'tinymce';  
import EmbedJS from 'embed-js';
import urlPlugin from 'embed-plugin-url';

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
    EditorModule
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
  isuploadingthepost: boolean = false;
  

  
  apiRoute = 'https://opengraph.io/api/1.1/site/:site?app_id=3ec5a83b-4cce-4f5e-8ed7-30f72e7414e7';
          
  appId = '3ec5a83b-4cce-4f5e-8ed7-30f72e7414e7';

  selectedColorElement: HTMLElement | null = null;
  writigtextpost:boolean =false;

  showvideobool:boolean =true;
  showaudiobool:boolean =false;
  showtextpostformbool:boolean =false;
  showimagepostsformbool:boolean =false;
  showlinkpostformbool: boolean = false;
  characterCount = 0;
  isNoImage: boolean = false;
  isLoadingPreview = false;
  onselectaudioorviodeselectdiscriptiontext: string = '';
   @ViewChild('embedContainer') embedContainer!: ElementRef;

  init: RawEditorOptions = {
    base_url: '/assets/tinymce',
    suffix: '.min',
    plugins: 'lists link image table code help wordcount',
    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
    setup: (editor: any) => {  // Use 'any' as a temporary workaround
      editor.on('PasteChange', (e: any) => {
        this.handlePaste(editor, e);
      });
    }
  };
  
  linkPreviewData: any = null;

  APIURL = environment.APIURL;
  @Input() postType: string = '';
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
   
 
    });

  }

  ngOnInit(): void {
    this.checkposttype(this.postType);
    this.userid = useridexported;
 
  


  }
 
async onLinkInput(event: Event) {
    const url = (event.target as HTMLInputElement).value;
    this.linkUrl = url;
    
    if (this.isValidUrl(url)) {
      await this.fetchLinkPreview(url);
    } else {
      this.clearPreview();
    }
  }

  isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

async fetchLinkPreview(url: string): Promise<void> {
  if (!isPlatformBrowser(this.platformId)) return;

  try {
    this.isLoadingPreview = true;
    this.clearPreview();

    const embed = new EmbedJS({
      input: url,
      plugins: [
        urlPlugin({
          fetchOptions: { 
            headers: { 'Accept': 'text/html' },
            mode: 'no-cors'
          }
        })
      ]
    });

    const { result } = await embed.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = result;
    const previewElement = tempDiv.querySelector('.embed-url');

    // First get basic data
    const previewData = {
      title: previewElement?.getAttribute('data-title') || this.extractTitleFromUrl(url) || 'No title available',
      description: previewElement?.getAttribute('data-description') || '',
      image: previewElement?.getAttribute('data-image') || '',
      url: previewElement?.getAttribute('data-url') || url,
      domain: this.getDomainFromUrl(url)
    };

    // If no image found, try to get favicon or logo
    if (!previewData.image) {
      previewData.image = await this.getFallbackImage(url);
    }

    this.linkPreviewData = previewData;
    console.log('Final preview data:', this.linkPreviewData);

  } catch (error) {
    console.error('Error fetching link preview:', error);
    this.linkPreviewData = {
      title: this.extractTitleFromUrl(url) || 'No title available',
      description: '',
      image: await this.getFallbackImage(url),
      url: url,
      domain: this.getDomainFromUrl(url)
    };
  } finally {
    this.isLoadingPreview = false;
  }
}

private async getFallbackImage(url: string): Promise<string> {
  try {
    const domain = this.getDomainFromUrl(url);
    
    // YouTube specific handling
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      const videoId = this.extractYouTubeId(url);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
    }

    // Define domain images with type safety
    const domainImages: Record<string, string> = {
      'npmjs.com': 'https://authy.com/wp-content/uploads/npm-logo.png',
      'github.com': 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      'twitter.com': 'https://abs.twimg.com/favicons/twitter.2.ico',
      // Add more domains as needed
    };

    // Find matching domain (case insensitive)
    const domainKey = Object.keys(domainImages).find(key => 
      domain.toLowerCase().includes(key.toLowerCase())
    );

    if (domainKey) {
      return domainImages[domainKey];
    }

    // Try favicon service
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    const faviconExists = await this.testImage(faviconUrl);
    return faviconExists ? faviconUrl : '';

  } catch {
    return '';
  }
}

private extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Helper to test if image exists
private testImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
handleImageError() {
  if (this.linkPreviewData.domain.includes('youtube.com')) {
    const videoId = this.extractYouTubeId(this.linkPreviewData.url);
    if (videoId) {
      // Try different YouTube thumbnail qualities
      this.linkPreviewData.image = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      return;
    }
  }
  this.linkPreviewData.image = '';
} 

// Helper method to extract domain from URL
private getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Helper method to extract a simple title from URL
private extractTitleFromUrl(url: string): string {
  try {
    const domain = this.getDomainFromUrl(url);
    const path = new URL(url).pathname;
    return `${domain}${path ? ' - ' + path.split('/').filter(Boolean).join(' ') : ''}`;
  } catch {
    return url;
  }
}

  private clearPreview(): void {
    this.linkPreviewData = null;
    if (this.embedContainer?.nativeElement) {
      this.embedContainer.nativeElement.innerHTML = '';
    }
  }


  
  async handlePaste(editor: Editor, e: any) {
    // alert('111111111111111');
    // Get pasted content
    const pastedText = e.clipboardData?.getData('text/plain');
    
    if (!pastedText) return;

    // Simple URL detection
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = pastedText.match(urlRegex);
    
    if (urls && urls.length > 0) {
      e.preventDefault();
      
      try {
        // Get link preview data
        const previewData = await getLinkPreview(urls[0]);
        
        // Create HTML for the preview card
        const previewHtml = this.generatePreviewHtml(previewData);
        
        // Insert at cursor position
        editor.insertContent(previewHtml);
      } catch (error) {
        console.error('Error fetching link preview:', error);
        // Fallback to just inserting the URL
        editor.insertContent(`<a href="${urls[0]}" target="_blank">${urls[0]}</a>`);
      }
    }
  }

  generatePreviewHtml(data: any): string {
    return `
      <div class="link-preview" style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 4px; max-width: 500px;">
        ${data.images && data.images.length > 0 ? 
          `<img src="${data.images[0]}" style="max-width: 100%; margin-bottom: 10px;">` : ''}
        <div>
          <a href="${data.url}" target="_blank" style="font-weight: bold; color: #333; text-decoration: none;">
            ${data.title || data.url}
          </a>
          ${data.description ? 
            `<p style="margin: 5px 0; color: #666; font-size: 0.9em;">${data.description}</p>` : ''}
        </div>
      </div>
    `;
  }
 

  checkposttype(postType:string):void{

    if(postType =="v"){
      this.showvideobool =true;
      this.showtextpostformbool =false;
      this.showaudiobool =false;
      this.showimagepostsformbool =false;
      this.showlinkpostformbool = false;
      
    }else if(postType =="a"){
      this.showvideobool =true;
      this.showtextpostformbool =false;
      this.showaudiobool =false;
      this.showimagepostsformbool =false;
      this.showlinkpostformbool = false;
    
    }else if(postType =="i"){
      this.showvideobool =false;
      this.showtextpostformbool =false;
      this.showimagepostsformbool = true;
      this.showaudiobool =false;
      this.showlinkpostformbool = false;
      
    }else if(postType == "t"){
      this.showvideobool =false;
      this.showtextpostformbool =true;
      this.showimagepostsformbool = false;
      this.showaudiobool =false;
      this.showlinkpostformbool = false;
      

    }else if(postType =="l"){
      this.showvideobool =false;
      this.showtextpostformbool =false;
      this.showimagepostsformbool = false;
      this.showaudiobool =false;
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

    this.linkUrl =link;
  await  this.getLinkPreview(this.linkUrl);
 
     
  }

  async getLinkPreview(url: string): Promise<void> {
    const formData = new FormData();
    formData.append('url', url);
  
    this.isLoadingPreview = true;
    this.linkPreviewData = null;
    this.isNoImage = false;
  
    try {
      const data = await firstValueFrom(this.http.post<any>(`${this.APIURL}get-preview`, formData));
      this.linkPreviewData = data;
  
      if (this.linkPreviewData.img) {
        this.isNoImage = false;
      } else {
        this.isNoImage = true;
      }
    } catch (error) {
      console.error('Error fetching link preview:', error);
    } finally {
      this.isLoadingPreview = false;
    }
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
    let text = textarea.value;
  
    // Enforce max character limit
    if (text.length > 700) {
      text = text.substring(0, 700);
      textarea.value = text;
      this.textPostForm.get('textPostbody')?.setValue(text); // Keep form in sync
    }
  
    this.characterCount = text.length;
  
    // Toggle preview visibility
    this.writigtextpost = text.trim().length > 0;
  
 
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
    const fileArray = Array.from(files);
  
    this.selectedFiles = [];
    this.imagePreviews = [];
  
    for (let file of fileArray) {
      if (file.size > 2 * 1024 * 1024) {
        console.log(`Original size of "${file.name}": ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        this.compressImage(file).then((compressedFile) => {
          console.log(`Compressed size of "${compressedFile.name}": ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
          this.selectedFiles.push(compressedFile);
  
          const reader = new FileReader();
          reader.readAsDataURL(compressedFile);
          reader.onload = () => {
            this.imagePreviews.push(reader.result as string);
          };
        });
      } else {
        this.selectedFiles.push(file);
  
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.imagePreviews.push(reader.result as string);
        };
      }
    }
  }
  
  private compressImage(file: File, maxWidth = 1024, quality = 0.7): Promise<File> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();
  
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        image.src = event.target?.result as string;
      };
  
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / image.width;
        const width = image.width > maxWidth ? maxWidth : image.width;
        const height = image.height * (width / image.width);
  
        canvas.width = width;
        canvas.height = height;
  
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas context not found');
  
        ctx.drawImage(image, 0, 0, width, height);
  
        canvas.toBlob((blob) => {
          if (!blob) return reject('Compression failed');
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, file.type, quality);
      };
  
      image.onerror = (err) => reject(err);
    });
  }
  


  removeImagePreview(preview: string): void {
    const index = this.imagePreviews.indexOf(preview);
    if (index > -1) {
      this.imagePreviews.splice(index, 1);
      this.selectedFiles.splice(index, 1);
    }
  }


  


 
  

  showvideoaudioform():void{
    this.showvideobool =true;
    this.showtextpostformbool =false;
    this.showimagepostsformbool =false;
    this.showlinkpostformbool = false;
    this.showaudiobool = false;
    this.onselectaudioorviodeselectdiscriptiontext = 'Short Discription';
  }

  showaudioform():void{
    this.showvideobool =false;
    this.showtextpostformbool =false;
    this.showimagepostsformbool =false;
    this.showlinkpostformbool = false;
    this.showaudiobool = true;
    this.onselectaudioorviodeselectdiscriptiontext = 'Audio Discription';

  }



  showimagepostsform():void{
    this.showvideobool =false;
    this.showtextpostformbool =false;
    this.showimagepostsformbool =true;
    this.showlinkpostformbool = false;
    this.showaudiobool = false;
    this.onselectaudioorviodeselectdiscriptiontext = '';


  }

  showtextpostform():void{
    this.showvideobool =false;
    this.showtextpostformbool =true;
    this.showimagepostsformbool =false;
    this.showlinkpostformbool = false;
    this.showaudiobool = false;
    this.onselectaudioorviodeselectdiscriptiontext = '';

  }

  showlinkpostform():void{
    this.showvideobool =false;
    this.showtextpostformbool =false;
    this.showimagepostsformbool =false;
    this.showlinkpostformbool = true;
    this.showaudiobool = false;
    this.onselectaudioorviodeselectdiscriptiontext = '';

  }



}
