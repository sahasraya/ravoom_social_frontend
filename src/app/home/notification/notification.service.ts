import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationEvent = new EventEmitter<void>();

  constructor() {}

  getNotificationEvent() {
    return this.notificationEvent;
  }

  triggerNotification() {
    this.notificationEvent.emit();
  }
}
