import { ApplicationRef, inject, Injectable } from '@angular/core';
import { first, Observable } from 'rxjs';
import {io, Socket} from 'socket.io-client'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class SocketService {
  private socket :Socket

  constructor() { 
    this.socket =io(environment.API_URL,{autoConnect:false})
    inject(ApplicationRef).isStable.pipe(
      first((isStable)=>isStable))
      .subscribe(()=>{this.socket.connect()})
  }

  userStatus():Observable<String>{
    return new Observable<String>(observer => {
      this.socket.on('userStatus', (data: any) => observer.next(data))
    })
  }

// Emit a message to the server
  sendCurrentUser(msg:any):void {
    // console.log('user: ', msg);
    this.socket.emit('setup', msg)
  }
  
  joinRoom(roomId:any):void {
    // console.log('roomId: ', roomId);
    this.socket.emit('joinChat', roomId)
  }

  sendMessage(msg:any):void {
    // console.log('msg-value: ', msg);
    this.socket.emit('newMessage', msg)
  }



  // // listen for messages from the server
  getMessages(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('messageReceived', (data: any) => observer.next(data))
    })
  }


  // Disconnect the client from the server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Socket disconnected');
    }
  }
  



}
