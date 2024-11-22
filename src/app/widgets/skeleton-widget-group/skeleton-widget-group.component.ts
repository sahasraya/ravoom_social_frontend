import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-skeleton-widget-group',
  standalone: true,
  imports: [CommonModule,NgxSkeletonLoaderModule],
  templateUrl: './skeleton-widget-group.component.html',
  styleUrl: './skeleton-widget-group.component.css'
})
export class SkeletonWidgetGroupComponent {
  skeletonTheme: any;



  constructor() {}

  ngOnInit(): void {
    this.updateSkeletonTheme(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateSkeletonTheme(event.target.innerWidth);
  }

  updateSkeletonTheme(width: number): void {
    if (width <= 500) {
      this.skeletonTheme = {
        width: '95vw',
        height: '45vh',
        marginLeft: '10px',
        borderRadius: '15px'
      };
    } else {
      this.skeletonTheme = {
        width: '100%',
        height: '45vh',
        marginLeft: '10px',
        borderRadius: '15px'
      };
    }
  }
}
