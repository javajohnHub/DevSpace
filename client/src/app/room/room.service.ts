import { Observable, Subject } from "rxjs";
import { SocketService } from "../shared/socket.service";

export class RoomService {
  public socket: any;
  constructor() {
    this.socket = SocketService.getInstance();
  }
  createRoom(roomName, peopleLimit) {
    var roomExists;
    this.socket.emit("check", roomName, function(data) {
      if (data) {
        roomExists = data.result;
      }
    });
    if (!roomExists) {
      this.socket.emit("createRoom", { roomName, peopleLimit }, function(
        err,
        result,
        data
      ) {
        if (err) {
          console.log(err);

          return;
        }

        if (data) {
          console.log(data);
        }
      });
    }
  }

  getRooms() {
    let observable = new Observable(observer => {
      this.socket.on("roomList", data => {
        console.log("room.service", data.rooms);
        observer.next(data);
      });
      return () => {
        //this.socket.disconnect();
      };
    });
    return observable;
  }
}
