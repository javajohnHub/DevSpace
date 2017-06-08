import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import {SocketService} from '../shared/socket.service';
export class NameService {
 socket: any;

  sendName(name){
    console.log(name);
    this.socket = SocketService.getInstance();
    var device = "desktop";
    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
      device = "mobile";
    }
    console.log(device);
    this.socket.emit("joinserver", {name, device}, function (err, result, data) {

      if(err){
        console.log(err);

        return;
      }

      if(data){
        console.log(data);
      }});
  }

  getPeople() {
    this.socket = SocketService.getInstance();
    let observable = new Observable(observer => {
      this.socket.on('update-people', (data) => {
        console.log('name.service', data);
        observer.next(data);
      });
      return () => {
        //this.socket.disconnect();
      };
    })
    return observable;
  }
}
