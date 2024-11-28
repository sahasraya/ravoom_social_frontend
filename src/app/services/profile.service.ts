import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProfileStateService {
  private state: { [key: string]: any } = {};

  saveState(profileuserid: string, data: any): void {
    this.state[profileuserid] = data;
  }

  getState(profileuserid: string): any | null {
    return this.state[profileuserid] || null;
  }

  clearState(profileuserid: string): void {
    delete this.state[profileuserid];
  }
}
