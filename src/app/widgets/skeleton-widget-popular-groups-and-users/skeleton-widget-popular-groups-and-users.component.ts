import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-skeleton-widget-popular-groups-and-users',
  standalone: true,
  imports: [NgxSkeletonLoaderModule,CommonModule],
  templateUrl: './skeleton-widget-popular-groups-and-users.component.html',
  styleUrl: './skeleton-widget-popular-groups-and-users.component.css'
})
export class SkeletonWidgetPopularGroupsAndUsersComponent {

}
