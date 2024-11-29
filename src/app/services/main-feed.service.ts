import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MainfeedStateService {
  private state: { [key: string]: any } = {};

  saveState(key: string, data: any): void {
    this.state[key] = data; // Use the provided key to store data
  }

  getState(key: string): any | null {
    return this.state[key] || null; // Retrieve data using the key
  }

  clearState(key: string): void {
    delete this.state[key]; // Clear the cache for the specific key
  }
}
