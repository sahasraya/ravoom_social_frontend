import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-image-larger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-larger.component.html',
  styleUrl: './image-larger.component.css'
})
export class ImageLargerComponent {

  @Input() imageUrl: string = '';
  @Output() close = new EventEmitter<void>(); 

  onClose(): void {
    this.close.emit();  
  }

}
