import {Component, OnInit, OnDestroy, AfterViewChecked, ElementRef, ViewChild} from '@angular/core';
import { ChatService }       from './chat.service';
import {SocketService} from '../shared/socket.service';
import {forEach} from "@angular/router/src/utils/collection";
@Component({
  selector: 'chat-component',
  templateUrl: './chat.component.html',
  providers: [ChatService, SocketService],
})
export class ChatComponent implements OnInit, OnDestroy {
  messages = [];
  chat;
  mess;
  whisper;
  messag;
  name: {};
  history;
  socket: any;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  constructor(private chatService:ChatService) {
    this.socket = SocketService.getInstance();
      this.socket.on('get name', (name) => {
        console.log('get name', name);
        this.name = name.name;
        this.messag = 'w:' + this.name + ':';
    })
    this.socket.on('history', (data) => {
      this.history = data;
      console.log('this.history',this.history);

    });

  }

  sendMessage(){
    this.chatService.sendMessage(this.messag);
    this.messag = '';
  }

  ngOnInit() {
    this.chat = this.chatService.getChat().subscribe(message => {
      this.messages.push(message);
    })
    this.mess = this.chatService.getMessages().subscribe(message => {
      this.messages.push(message);
    })
    this.whisper = this.chatService.getWhisper().subscribe(whisper => {
      this.messages.push(whisper);
    })


    this.scrollToBottom();
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    this.chat.unsubscribe();
    this.mess.unsubscribe();
    this.whisper.unsubscribe();
  }
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
  zeroPad(num, size) {
  var s = num + "";
  while (s.length < size)
    s = "0" + s;
  return s;
}
  timeFormat(msTime) {
  var d = new Date(msTime);
  return this.zeroPad(d.getHours(), 2) + ":" +
    this.zeroPad(d.getMinutes(), 2) + ":" +
    this.zeroPad(d.getSeconds(), 2) + " ";
}
}
