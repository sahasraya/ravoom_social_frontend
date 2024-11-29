import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PopularGroupStateService {
  private state: { [key: string]: any } = {};

  saveState(key: string, data: any): void {
    this.state[key] = data;  
  }

  getState(key: string): any | null {
    return this.state[key] || null;  
  }

  clearState(key: string): void {
    delete this.state[key];  
  }
}
