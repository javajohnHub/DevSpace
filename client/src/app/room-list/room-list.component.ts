import { Component, OnInit } from '@angular/core';
import { RoomService }       from '../room/room.service';
import {SocketService} from '../shared/socket.service';
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css'],
  providers: [RoomService, SocketService]
})
export class RoomListComponent implements OnInit {
  rooms = [];
  connection;
  room;
  keysArray =[];
  socket: any;

  constructor(private roomService:RoomService) { }

  ngOnInit() {
    this.socket = SocketService.getInstance();
    this.connection = this.roomService.getRooms().subscribe(room => {
      this.rooms = [];
      this.rooms.push(room);
      this.keysArray = Object.keys(this.rooms[0].rooms);


      console.log('rooms', this.rooms);
    });



  }

  join(id){
    this.socket.emit("joinRoom", id);
  }
  remove(id){
    this.socket.emit("removeRoom", id);
  }
  leave(id){
    this.socket.emit("leaveRoom", id);
  }
  ngOnDestroy() {
    this.connection.unsubscribe();
  }



}
