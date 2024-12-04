import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-skeleton-widget-typing-search',
  standalone: true,
  imports: [CommonModule,NgxSkeletonLoaderModule],
  templateUrl: './skeleton-widget-typing-search.component.html',
  styleUrl: './skeleton-widget-typing-search.component.css'
})
export class SkeletonWidgetTypingSearchComponent {

}
