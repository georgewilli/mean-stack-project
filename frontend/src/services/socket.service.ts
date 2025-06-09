import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

// src/app/models/socket-events.model.ts
export interface ContactLockPayload {
    contactId: string;
    userId: string;
    userName: string;
    lockedAt: string;
  }
  
  export interface ContactUnlockPayload {
    contactId: string;
  }
  
  export interface LockFailedPayload {
    contactId: string;
    message: string;
    lockedBy: string;
  }
  
  export interface LockSuccessPayload {
    contactId: string;
  }
  
  export interface InitialLockState {
    contactId: string;
    lockedBy: string;
    lockedAt: string;
  }
  
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3001'); // use your backend host
  }

  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  listen<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      this.socket.on(event, (data: T) => subscriber.next(data));
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}