import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-skeleton-widget',
  standalone: true,
  imports: [NgxSkeletonLoaderModule,CommonModule],
  templateUrl: './skeleton-widget.component.html',
  styleUrl: './skeleton-widget.component.css'
})
export class SkeletonWidgetComponent {

}
