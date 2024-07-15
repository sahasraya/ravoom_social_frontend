import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearchComponent } from '../widgets/search/search.component';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../widgets/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,RouterModule,SearchComponent,HttpClientModule,HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
