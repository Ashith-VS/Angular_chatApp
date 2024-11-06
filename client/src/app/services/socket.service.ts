import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {io, Socket} from 'socket.io-client'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class SocketService {
  private socket :Socket

  constructor() { 
    this.socket =io(environment.API_URL, { autoConnect: false })
  }

// Emit a message to the server
  sendMessage(msg:any):void {
    console.log('msg4466: ', msg);
    this.socket.emit('message', msg)
  }

  // listen for messages from the server
  getMessages(): Observable<string> {
    return new Observable<string>(observer => {
      this.socket.on('message', (data: any) => observer.next(data))
    })
  }
   
  
}
