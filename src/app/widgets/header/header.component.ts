import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterModule,SearchComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{

  userid: string = "";
  showSignOutMessage: boolean = false;
  searchText: string = '';

  ngOnInit(): void {
    this.userid = localStorage.getItem('wmd') || '';
  }

  handleSearchText(text: string) {
    this.searchText = text;
  }
  logout(): void {
    localStorage.clear();
    this.showSignOutMessage = true;

    setTimeout(() => {
      this.showSignOutMessage = false;
      location.reload();  
    }, 3000);  
  }

}
