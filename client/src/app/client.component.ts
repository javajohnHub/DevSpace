import { Component, HostListener} from '@angular/core';
import {SocketService} from './shared/socket.service';

@Component({
  selector: 'client-app',
  templateUrl: './client.component.html',
  providers: [SocketService]
})
export class ClientAppComponent {
  socket: any;
  cursor = HTMLImageElement;
  constructor(){
    this.socket = SocketService.getInstance();
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

  @HostListener('mousemove', ['$event'])
  onmousemove(event: MouseEvent) {
    event.preventDefault()
    console.log('movement')
    this.socket.emit("mouse movement", { pos: { x: event.clientX, y: event.clientY } });
  }
}
