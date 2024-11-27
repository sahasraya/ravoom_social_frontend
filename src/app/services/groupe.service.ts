import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GroupStateService {
  private state: { [key: string]: any } = {};

  saveState(groupid: string, data: any): void {
    this.state[groupid] = data;
  }

  getState(groupid: string): any | null {
    return this.state[groupid] || null;
  }

  clearState(groupid: string): void {
    delete this.state[groupid];
  }
}
