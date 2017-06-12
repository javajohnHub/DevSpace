import * as io from 'socket.io-client';

export class SocketService  {

  static instance:SocketService = null;
  static isCreating:Boolean = false;
  public socket:any;
  private url = 'https://devspacecode.herokuapp.com';

  /**
   * constuctor with control handle, that you can not instantiate by new NodoSocket();
   * socket should act as a real singleton, not to have multiple socket connection instances
   * within the same application to the same resource
   */
  constructor() {
    if (!SocketService.isCreating) {
      throw new Error("This is a real singleton. Get an instance via var socket = SocketService.getInsance(); !");
    }

    console.info("creating socket object");

    console.info("establishing connection to server...");
    this.socket = io.connect(this.url);

  }

  /**
   * receive data form Socket-Server
   * @param eventName
   * @param callback
   */
  public on(eventName, callback):void {
    this.socket.on(eventName, function () {
      var args = arguments;
      if (typeof callback == "function") {
        callback.apply(this.socket, args);
      }
    });
  }

  /**
   * submit data to socket-server
   * @param eventName
   * @param data
   * @param callback
   */
  public emit(eventName, data, callback):void {
    this.socket.emit(eventName, data, function () {
      var args = arguments;
      if (typeof callback == "function") {
        callback.apply(this.socket, args);

      }
    });
  }




  /**
   * get instance wrapper
   * @returns {SocketService}
   */
  public static getInstance():SocketService {

    if (SocketService.instance === null) {
      SocketService.isCreating = true;
      SocketService.instance = new SocketService();
      SocketService.isCreating = false;
    }

    console.log("SocketService.instance",SocketService.instance);
    return SocketService.instance;

  }


}

/**
 usage:
 in an angular2 component controller, you may use it that way:


 var mySocket = SocketService.getInstance();


 !!!IMPORTANT: the arguments you will get back in your callback depends on your socket server implementation

 mySocket.emit("api:model", {
                requestID: "aSampleRequestID,
                model: "aSampleCollectionName,
                action: "update",
                id: "aSampleID",
                doc: {firstname:"john", lastname:"doe"}
            }, function (err, result, data) {

                if(err){
                    // handle error here

                    return;
                }

                if(data){
                    // handle your data here
                }



            });


 or for listening on events

 !!!IMPORTANT: the arguments you will get back in your callback depends on your socket server implementation

 mySocket.on("api:model:created", function (collectionName, id, editor, requestID){
        // handle your stuff here
    });

 */


