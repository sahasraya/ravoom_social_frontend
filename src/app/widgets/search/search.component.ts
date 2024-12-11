import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { PopularPostComponent } from '../../home/popular-post/popular-post.component';
import { environment } from '../../../environments/environment';
import { SearchService } from '../../services/search.service';
import { SkeletonWidgetTypingSearchComponent } from '../skeleton-widget-typing-search/skeleton-widget-typing-search.component';
 

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule,PopularPostComponent,SkeletonWidgetTypingSearchComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit{


  APIURL = environment.APIURL;
  showLargerImage: boolean = false;
  user:any=[];
  group:any=[];
  searchText: string = '';
  isFacoused: boolean = false;
  isloading: boolean = false;
  ispressentere: boolean = true;

  searchUsers: any=[];
 

  constructor( private searchService:SearchService, private http:HttpClient,private router:Router ) { }

  ngOnInit(): void {
    this.searchUsers = JSON.parse(localStorage.getItem('searchUsers') || '[]');

  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.user = [];
    this.isFacoused = false;

  }


  async searchResult(): Promise<void> {
    this.isFacoused = false;
  
    if (this.isloading) return;  
    this.isloading = true; 
    this.ispressentere = true;
  
    const formData = new FormData();
    formData.append('query', this.searchText);
  
 
    this.http.post<any>(`${this.APIURL}search-result`, formData).subscribe({
      next: response => {
        this.isloading = false;   
        this.user = response.users;
        this.group = response.groups;
      },
      error: (error: HttpErrorResponse) => {
        this.isloading = false;   
        console.error('There was an error!', error);
      }
    });
  }
  




  stopPropagation(event: Event) {
    event.stopPropagation();
  }
  
  showSavedUsers() {
this.isFacoused = true;
  }



  clearSearch(): void {
    this.searchText = '';
    this.user = [];
    this.group = [];
  }
  
 


  addToLocalStorage(username: string, profileImage: string, userid: any) {
    const userExists = this.searchUsers.some((user: { userid: any; }) => user.userid === userid);
    if (!userExists) {
      const userObj = { username, profileImage, userid };
      this.searchUsers.push(userObj);
      localStorage.setItem('searchUsers', JSON.stringify(this.searchUsers));
    }
  }

  removeFromLocalStorage(userid: any) {

    this.searchUsers = this.searchUsers.filter((u: { userid: any; }) => u.userid !== userid);
    localStorage.setItem('searchUsers', JSON.stringify(this.searchUsers));
  }




  handleEnterKeyPress() {
 
    if(this.searchText.trim() !=""){
      const query = this.searchText;

      this.searchResult();
      this.ispressentere = false;
 
 
      this.router.navigate(['/home/result', query]);

    }
 

  }



 

}
