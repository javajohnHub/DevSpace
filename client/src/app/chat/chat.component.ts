import {Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild} from '@angular/core';
import { ChatService }       from './chat.service';
import {SocketService} from '../shared/socket.service';

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
  cursor = HTMLImageElement;

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

    this.socket.on('draw_cursor', function (data) {
      var el = this.getCursorElement(data.id);
      el.style.x = data.line[0].x;
      el.style.y = data.line[0].y;
    })
    const virtualMouse = {
      // moves a this.cursor with corresponding id to position pos
      // if this.cursor with that id doesn't exist we create one in position pos
      move: function (id, pos) {
        this.cursor = document.getElementById('cursor-' + id);
        if (!this.cursor) {
          this.cursor = document.createElement('img');
          this.cursor.className = 'virtualMouse';
          this.cursor.id = 'cursor-' + id;
          this.cursor.src = '../assets/img/cursor.png';
          this.cursor.style.position = 'absolute';
          document.body.appendChild(this.cursor);
        }
        this.cursor.style.left = pos.x + 'px';
        this.cursor.style.top = pos.y + 'px';
      },
      // remove this.cursor with corresponding id
      remove: function (id) {
        this.cursor = document.getElementById('cursor-' + id);
        this.cursor.parentNode.removeChild(this.cursor);
      }
    };

    // initial setup, should only happen once right after socket connection has been established
    this.socket.on('mouse setup', function (mouses) {

      for (const mouse_id in mouses) {
        if (mouse_id) {
          virtualMouse.move(mouse_id, mouses.mouse_id);
        }
      }
    });

    // update mouse position
    this.socket.on('mouse update', function (mouse) {
      virtualMouse.move(mouse.id, mouse.pos);
    });

    // remove disconnected mouse
    this.socket.on('mouse disconnect', function (mouse) {
      virtualMouse.remove(mouse.id);
    });

  }
  getCursorElement (id) {
    var elementId = 'cursor-' + id;
    var element = document.getElementById(elementId);
    if(element == null) {
      element = document.createElement('div');
      element.id = elementId;
      element.className = 'cursor';
      // Perhaps you want to attach these elements another parent than document
      document.appendChild(element);
    }
    return element;
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
  @HostListener('mousemove', ['$event'])
  onmousemove(event: MouseEvent) {
    event.preventDefault()
    console.log('movement')
    this.socket.emit("mouse movement", { pos: { x: event.clientX, y: event.clientY } });
  }
}
