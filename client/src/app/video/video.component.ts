import { Component, OnInit, ViewChild} from '@angular/core';
import * as Peer from 'peerjs_fork_firefox40';

import {SocketService} from '../shared/socket.service';
@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {

  @ViewChild('myVideo') myVideo: any;
  @ViewChild('theirVideo') theirVideo: any;

  peer;
  anotherid;
  mypeerid;
 socket: any;
  constructor() {
    this.socket = SocketService.getInstance();
  }

  ngOnInit() {
    let myVideo = this.myVideo.nativeElement;
    let theirVideo = this.theirVideo.nativeElement;
    this.peer = new Peer({
      host: 'peerjs-rapbattle.herokuapp.com',
      path: '/',
      port: 80,
      secure: true,
      debug: 3
    });

    setTimeout(() => {
      this.mypeerid = this.peer.id;
      if(this.mypeerid != undefined){
        this.socket.emit('peer id', {peerId: this.mypeerid});
      }

    }, 3000);

    this.peer.on('connection', function (conn) {
      conn.on('data', function (data) {
        // Will print 'hi!'
        console.log(data);
      });
    });

    var n = <any>navigator;

    n.getUserMedia = ( n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia || n.msGetUserMedia );

    this.peer.on('call', function (call) {

      n.getUserMedia({video: true, audio: true}, function (stream) {
        call.answer(stream);
        call.on('stream', function (remotestream) {
          theirVideo.src = URL.createObjectURL(remotestream);
          theirVideo.play();
          myVideo.src = URL.createObjectURL(stream);
          myVideo.play();
        })
      }, function (err) {
        console.log('Failed to get stream', err);
      })
    })

    this.socket.on('request', (data)=> {
      console.log('request', data);
      if(data.peerId){
        if (confirm('Would you like to accept a call from ' + data.person)) {
          this.videoconnect(data.peerId)
        } else {
          console.log('canceled');
        }
      }


    })
  }

  connect() {
    var conn = this.peer.connect(this.anotherid);
    conn.on('open', function () {
      conn.send('Message from that id');
    });
  }

  videoconnect(fname) {
    let myVideo = this.myVideo.nativeElement;
    let theirVideo = this.theirVideo.nativeElement;
    var localvar = this.peer;

    //var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    var n = <any>navigator;

    n.getUserMedia = ( n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia || n.msGetUserMedia );

    n.getUserMedia({video: true, audio: true}, function (stream) {
      var call = localvar.call(fname, stream);
      call.on('stream', function (remotestream) {
        theirVideo.src = URL.createObjectURL(remotestream);
        theirVideo.play();
        myVideo.src = URL.createObjectURL(stream);
        myVideo.play();
      })
    }, function (err) {
      console.log('Failed to get stream', err);
    })


  }
}
