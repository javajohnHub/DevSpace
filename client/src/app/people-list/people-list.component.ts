import { Component, OnInit, Input, OnChanges} from '@angular/core';
import { NameService }       from '../name/name.service';
import {SocketService} from '../shared/socket.service';

@Component({
  selector: 'app-people-list',
  templateUrl: './people-list.component.html',
  styleUrls: ['./people-list.component.css'],
  providers: [NameService, SocketService],
})
export class PeopleListComponent implements OnInit {
  people = [];
  connection;
  keysArray =[];
  socket: any;
  constructor(private nameService:NameService ) {

    this.socket = SocketService.getInstance();
  }

  ngOnInit() {
    this.connection = this.nameService.getPeople().subscribe(person => {
      this.people = [];
      this.people.push(person);
      this.keysArray = Object.keys(this.people[0].people);
      console.log('people', this.people);
    });

  }
 whisper(name){
    this.socket.emit('send name', {name: name}, function (err, result, data) {

      if(err){
        // handle error here
        console.log(err);
        return;
      }

      if(data){
        console.log(data, result);
      }});
 }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

}
