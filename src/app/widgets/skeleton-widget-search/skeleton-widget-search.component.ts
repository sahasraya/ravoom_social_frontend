import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-skeleton-widget-search',
  standalone: true,
  imports: [CommonModule,NgxSkeletonLoaderModule],
  templateUrl: './skeleton-widget-search.component.html',
  styleUrl: './skeleton-widget-search.component.css'
})
export class SkeletonWidgetSearchComponent {

}
