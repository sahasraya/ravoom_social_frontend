import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{

  userid: string = "";
  showSignOutMessage: boolean = false;

  ngOnInit(): void {
    this.userid = localStorage.getItem('wmd') || '';
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
