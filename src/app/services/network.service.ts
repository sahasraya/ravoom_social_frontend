import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private onlineStatusSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public onlineStatus$ = this.onlineStatusSubject.asObservable();

  constructor(private ngZone: NgZone) {
    // Listen for online and offline events
    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));

    // Check the status periodically
    this.checkOnlineStatusContinuously();
  }

  private updateOnlineStatus() {
    this.ngZone.run(() => {
      this.onlineStatusSubject.next(navigator.onLine);
    });
  }

  private checkOnlineStatusContinuously() {
    setInterval(() => {
      this.updateOnlineStatus();
    }, 5000); // Check every 5 seconds (adjust as necessary)
  }
}
