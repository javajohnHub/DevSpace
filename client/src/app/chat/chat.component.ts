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
  messag: string = '';
  name: {};
  history;
  socket: any;
  cursors: {};
  pressed: boolean = false;
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

    this.socket.on('mouse', function (data) {
      var id = data.id;
      var x = data.x;
      var y = data.y;
      var pressed = data.pressed;

      var cursor = this.cursors[id];
      if (!cursor) {
        cursor = this.cursors[id] = document.createElement('i');
        document.body.appendChild(cursor);
      }
      if (pressed) {
        cursor.className = 'cursor fa fa-hand-rock-o';
      } else {
        cursor.className = 'cursor fa fa-hand-pointer-o';
      }
      cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });

    window.addEventListener('mousedown', this.onMousedown);
    window.addEventListener('touchstart', this.onMousedown);
  }

  onMousedown (e) {
  e.preventDefault();

  if (e.type === 'touchstart') {
    this.pressed = false;

    this.sendMouse({x: e.touches[0].pageX, y: e.touches[0].pageY});

    window.addEventListener('touchmove', this.onMousemove);
    window.addEventListener('touchend', this.onMouseup);
  } else {
    this.pressed = true;

    this.sendMouse({x: e.pageX, y: e.pageY});

    window.addEventListener('mousemove', this.onMousemove);
    window.addEventListener('mouseup', this.onMouseup);
  }
}

  onMousemove (e) {
    if (e.type === 'touchmove') {
      this.sendMouse({x: e.touches[0].pageX, y: e.touches[0].pageY});
    } else {
      this.sendMouse({x: e.pageX, y: e.pageY});
    }
  }

  onMouseup (e) {
    this.pressed = false;
    if (e.type === 'touchend') {
      window.removeEventListener('touchmove', this.onMousemove);
      window.removeEventListener('touchend', this.onMouseup);

      this.sendMouse({x: e.touches[0].pageX, y: e.touches[0].pageY});
    } else {
      window.removeEventListener('touchmove', this.onMousemove);
      window.removeEventListener('touchend', this.onMouseup);

      this.sendMouse({x: e.pageX, y: e.pageY});
    }
  }

  sendMouse (data) {
    this.socket.emit('mouse', {
      x: data.x - window.innerWidth / 2 | 0,
      y: data.y - window.innerHeight / 2 | 0,
      pressed: this.pressed
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
