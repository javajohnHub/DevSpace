import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import {SocketService} from '../shared/socket.service';

export class ChatService {
  socket;

  constructor() {
    this.socket = SocketService.getInstance();
  }

  sendMessage(msg) {
    this.socket.emit('send', {msTime: new Date().getTime(), msg: msg});
  }

  getMessages() {
    let messages = new Observable(observer => {
      this.socket.on('update', (data) => {
        console.log('getMessages', data);
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return messages;
  }

  getChat() {
    let chat = new Observable(observer => {
      this.socket.on('chat', (data) => {
        console.log('getChat', data);
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return chat;
  }

  getWhisper() {
    let whisper = new Observable(observer => {
      this.socket.on('whisper', (data) => {
        console.log('getWhisper', data);
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return whisper;
  }

  getName() {
    let name = new Observable(observer => {
      this.socket.on('name', (data) => {
        console.log('name', data);
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return name;
  }
}
