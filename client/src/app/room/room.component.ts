import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoomService }       from './room.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {
  rooms = [];
  connection;
  room: string = '';
  peopleLimit;
  constructor(private roomService:RoomService) { }

  createRoom(){
    this.roomService.createRoom(this.room, this.peopleLimit);
    this.room = '';
  }

  ngOnInit() {
    this.connection = this.roomService.getRooms().subscribe(room => {
      this.rooms.push(room);
    })
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
