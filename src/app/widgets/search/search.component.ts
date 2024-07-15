import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { PopularPostComponent } from '../../home/popular-post/popular-post.component';
 

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule,RouterOutlet,PopularPostComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit{


  APIURL = 'http://127.0.0.1:8000/';
  showLargerImage: boolean = false;
  user:any=[];
  searchText: string = '';
  isFacoused:boolean = false;

  searchUsers: any=[];
 

  constructor( private http:HttpClient,private router:Router ) { }

  ngOnInit(): void {
    this.searchUsers = JSON.parse(localStorage.getItem('searchUsers') || '[]');

  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.user = [];
    this.isFacoused = false;

  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
  
  showSavedUsers() {
this.isFacoused = true;
  }




 async searchResult():Promise<void> {
this.isFacoused = false;
 
    const formData = new FormData();
    formData.append('query', this.searchText);

    this.http.post<any>(`${this.APIURL}search-result`, formData).subscribe({
      next: response => {
        this.user = response;
        console.log(this.user);
      },
      error: (error: HttpErrorResponse) => {
        console.error('There was an error!', error);
      }
    });
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
 
      this.router.navigate(['/home/result', query]);

    }
 

  }



 

}
