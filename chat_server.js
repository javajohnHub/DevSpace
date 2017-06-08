var express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , io = require("socket.io").listen(server)
    , uuid = require('node-uuid')
    , Room = require('./room.js')
    , _ = require('underscore')._;
var sanitize = require('validator');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var port = process.env.PORT || 5000;

app.set('port', port);
app.set('host', '127.0.0.1');
app.set('ipaddr', "codeaddict.me");
app.use(bodyParser());
app.use(methodOverride());
app.use(express.static(__dirname + '/dist'));
app.use('/components', express.static(__dirname + '/components'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/icons', express.static(__dirname + '/icons'));
app.set('views', __dirname + '/views');

app.engine('html', require('ejs').renderFile);

app.get('/', function (req, res) {
    res.sendFile('index.html');
});
server.listen(app.get('port'), function(){

});

io.set("log level", 1);
var people = {};
var rooms = {};
var sockets = [];
var chatHistory = {};
var color;


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}



io.sockets.on("connection", function (socket) {
    //socket.emit('refresh', {body: body});
    var color = getRandomColor();

    socket.on('refresh', function (body) {
        var room = rooms[people[socket.id].inroom];
        if(room){
            room.body = body;
        }

    });

    socket.on('change', function (op) {
        console.log('socket on change',socket.room);
        if(socket.room != undefined){
            if (op.origin == '+input' || op.origin == 'paste' || op.origin == '+delete') {
                //socket.broadcast.emit('change', op);
                socket.broadcast.to(socket.room).emit('change', op);
            };
        }

    });




    socket.on("joinserver", function(data) {
        console.log('111',data.device);
        var clean_name = sanitize.escape(data.name);
        var exists = false;
        var ownerRoomID = inRoomID = null;

        _.find(people, function(key,value) {
            if (key.name.toLowerCase() === clean_name.toLowerCase())
                return exists = true;
        });
        if (exists) {//provide unique username:
            var randomNumber=Math.floor(Math.random()*1001)
            do {
                proposedName = clean_name+randomNumber;
                _.find(people, function(key,value) {
                    if (key.name.toLowerCase() === proposedName.toLowerCase())
                        return exists = true;
                });
            } while (!exists);
            socket.emit("exists", {msg: "The username already exists, please pick another one.", proposedName: proposedName});
        } else {
            people[socket.id] = {"name" : clean_name, "owns" : ownerRoomID, "inroom": inRoomID, "device": data.device};
            socket.emit("update",{username:'Admin',text: "You have connected to the server."});
            io.sockets.emit("update",{username:'Admin',text: people[socket.id].name + " is online."})
            sizePeople = _.size(people);
            sizeRooms = _.size(rooms);
            io.sockets.emit("update-people", {people: people, count: sizePeople});
            socket.emit("roomList", {rooms: rooms, count: sizeRooms});
            socket.emit("joined"); //extra emit for GeoLocation
            sockets.push(socket);
        }
    });

    socket.on("getOnlinePeople", function(fn) {
        fn({people: people});
    });



    socket.on("typing", function(data) {
        if (typeof people[socket.id] !== "undefined")
            io.sockets.in(socket.room).emit("isTyping", {isTyping: data, person: people[socket.id].name});
    });

    socket.on("send", function({msTime, msg}) {
        //process.exit(1);
        var re = /^[w]:.*:/;
        var whisper = re.test(msg);
        var whisperStr = msg.split(":");
        console.log('158',msTime,msg, whisper);
        var found = false;
        if (whisper) {
            var whisperTo = sanitize.escape(whisperStr[1]);
            var keys = Object.keys(people);
            if (keys.length != 0) {
                for (var i = 0; i<keys.length; i++) {
                    if (people[keys[i]].name === whisperTo) {
                        var whisperId = keys[i];
                        found = true;
                        if (socket.id === whisperId) { //can't whisper to ourselves
                            socket.emit("update", {username:'Admin',text: "You can't whisper to yourself."});
                        }
                        break;
                    }
                }
            }
            if (found && socket.id !== whisperId) {
                var whisperTo = sanitize.escape(whisperStr[1]);
                var whisperMsg = sanitize.escape(whisperStr[2]);
                socket.emit("whisper", {msTime, name: "You ", to: people[whisperId].name, msg:whisperMsg});
                io.sockets.connected[whisperId].emit("whisper", {msTime, person: people[socket.id], msg:whisperMsg});
            } else {
                socket.emit("update", {username:'Admin',text: "Can't find " + whisperTo});
            }
        } else {
            //console.log('loggit', io.sockets.adapter.rooms[socket.room], socket.id);
            if (io.sockets.adapter.rooms[socket.room] != undefined) {
                io.sockets.in(socket.room).emit("chat", {msTime: msTime, people: people[socket.id], msg: sanitize.escape(msg), color:color, username:people[socket.id].name});
                socket.emit("isTyping", false);
                if (_.size(chatHistory[socket.room]) > 10) {
                    chatHistory[socket.room].splice(0,1);
                } else {
                    if(chatHistory[socket.room] != undefined){
                        chatHistory[socket.room].push(people[socket.id].name + ": " + sanitize.escape(msg));
                    }
                }
            } else {
                socket.emit("update", {username:'Admin',text: "Please connect to a room."});
            }
        }
    });

    socket.on("disconnect", function() {
        if (typeof people[socket.id] !== "undefined") { //this handles the refresh of the name screen
            purge(socket, "disconnect");
        }
    });

    socket.on("theme", function(data) {
        console.log('theme');
        socket.emit('send theme', data);
    });
    socket.on("mode", function(data) {
        console.log('mode');
        socket.emit('send mode', data);
    });
    //Room functions
    socket.on("createRoom", function({roomName, peopleLimit}) {
        if (people[socket.id].inroom) {
            socket.emit("update", {username:'Admin',text: "You are already in a room. Please leave it first to create your own."});
        } else if (!people[socket.id].owns) {
            var id = uuid.v4();
            var clean_name = sanitize.escape(roomName);
            var room = new Room(clean_name, id, socket.id);
            rooms[id] = room;
            sizeRooms = _.size(rooms);


            //add room to socket, and auto join the creator of the room
            room.peopleLimit = peopleLimit;
            socket.room = clean_name;
            socket.join(socket.room);
            people[socket.id].owns = id;
            people[socket.id].inroom = id;
            room.addPerson(socket.id);
            socket.emit("update", {username:'Admin',text: "Welcome to " + room.name});
            socket.emit("sendRoomID", {id: id});
            chatHistory[socket.room] = [];
            io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
        } else {
            socket.emit("update", {username:'Admin',text: "You have already created a room."});
        }
    });

    socket.on("check", function(name, fn) {
        var match = false;
        _.find(rooms, function(key,value) {
            if (key.name === name)
                return match = true;
        });
        fn({result: match});
    });

    socket.on("removeRoom", function(id) {
        var room = rooms[id];
        if (socket.id === room.owner) {
            purge(socket, "removeRoom");
        } else {
            socket.emit("update", {username:'Admin',text: "Only the owner can remove a room."});
        }
    });

    socket.on("joinRoom", function(id) {
        if (typeof people[socket.id] !== "undefined") {
            var room = rooms[id];
            if (socket.id === room.owner) {
                socket.emit("update", {username:'Admin',text: "You are the owner of this room and you have already been joined."});
            } else {
                if (_.contains((room.people), socket.id)) {
                    socket.emit("update", {username:'Admin',text: "You have already joined this room."});
                } else {
                    if (people[socket.id].inroom !== null) {
                        socket.emit("update", {username:'Admin',text: "You are already in a room (" +rooms[people[socket.id].inroom].name+ "), please leave it first to join another room."});
                    } if(room.people.length < room.peopleLimit){
                        room.addPerson(socket.id);
                        people[socket.id].inroom = id;
                        socket.room = room.name;
                        socket.join(socket.room);
                        user = people[socket.id];
                        io.sockets.in(socket.room).emit("update", {username:'Admin',text:  user.name + "has connected to " + room.name});
                        socket.emit("update", {username:'Admin',text: "Welcome to " + room.name + "."});
                        socket.emit("sendRoomID", {id: id});
                        socket.emit('refresh', room.body);
                        console.log(room.people.length);
                        var keys = _.keys(chatHistory);
                        if (_.contains(keys, socket.room)) {
                            console.log('history emitted');
                            socket.emit("history", chatHistory[socket.room]);
                        }
                    }else {
                        socket.emit("update", {username:'Admin',text: "The room is full."});



                    }
                }
            }
        } else {
            socket.emit("update", {username:'Admin',text: "Please enter a valid name first."});
        }
    });
    socket.on('send name', function(name){
        socket.emit('get name', name)
        console.log(name);

    })

    socket.on("leaveRoom", function(id) {
        var room = rooms[id];
        console.log('leave', id);
        if (room)
            purge(socket, "leaveRoom");
    });

    function purge(s, action) {
        /*
         The action will determine how we deal with the room/user removal.
         These are the following scenarios:
         if the user is the owner and (s)he:
         1) disconnects (i.e. leaves the whole server)
         - advise users
         - delete user from people object
         - delete room from rooms object
         - delete chat history
         - remove all users from room that is owned by disconnecting user
         2) removes the room
         - same as above except except not removing user from the people object
         3) leaves the room
         - same as above
         if the user is not an owner and (s)he's in a room:
         1) disconnects
         - delete user from people object
         - remove user from room.people object
         2) removes the room
         - produce error message (only owners can remove rooms)
         3) leaves the room
         - same as point 1 except not removing user from the people object
         if the user is not an owner and not in a room:
         1) disconnects
         - same as above except not removing user from room.people object
         2) removes the room
         - produce error message (only owners can remove rooms)
         3) leaves the room
         - n/a
         */
        if (people[s.id].inroom) { //user is in a room
            var room = rooms[people[s.id].inroom]; //check which room user is in.
            if (s.id === room.owner) { //user in room and owns room
                if (action === "disconnect") {
                    io.sockets.in(s.room).emit("update", {username:'Admin',text: "The owner (" +people[s.id].name + ") has left the server. The room is removed and you have been disconnected from it as well."});
                    var socketids = [];
                    for (var i=0; i<sockets.length; i++) {
                        socketids.push(sockets[i].id);
                        if(_.contains((socketids)), room.people) {
                            sockets[i].leave(room.name);
                        }
                    }

                    if(_.contains((room.people)), s.id) {
                        for (var i=0; i<room.people.length; i++) {
                            people[room.people[i]].inroom = null;
                        }
                    }
                    room.people = _.without(room.people, s.id); //remove people from the room:people{}collection
                    delete rooms[people[s.id].owns]; //delete the room
                    delete people[s.id]; //delete user from people collection
                    delete chatHistory[room.name]; //delete the chat history
                    sizePeople = _.size(people);
                    sizeRooms = _.size(rooms);
                    io.sockets.emit("update-people", {people: people, count: sizePeople});
                    io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
                    var o = _.findWhere(sockets, {'id': s.id});
                    sockets = _.without(sockets, o);
                } else if (action === "removeRoom") { //room owner removes room
                    io.sockets.in(s.room).emit("update", {username:'Admin',text: "The owner (" +people[s.id].name + ") has removed the room. The room is removed and you have been disconnected from it as well."});
                    var socketids = [];
                    for (var i=0; i<sockets.length; i++) {
                        socketids.push(sockets[i].id);
                        if(_.contains((socketids)), room.people) {
                            sockets[i].leave(room.name);
                        }
                    }

                    if(_.contains((room.people)), s.id) {
                        for (var i=0; i<room.people.length; i++) {
                            people[room.people[i]].inroom = null;
                        }
                    }
                    delete rooms[people[s.id].owns];
                    people[s.id].owns = null;
                    room.people = _.without(room.people, s.id); //remove people from the room:people{}collection
                    delete chatHistory[room.name]; //delete the chat history
                    sizeRooms = _.size(rooms);
                    io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
                } else if (action === "leaveRoom") { //room owner leaves room
                    io.sockets.in(s.room).emit("update", {username:'Admin',text: "The owner (" +people[s.id].name + ") has left the room. The room is removed and you have been disconnected from it as well."});
                    var socketids = [];
                    for (var i=0; i<sockets.length; i++) {
                        socketids.push(sockets[i].id);
                        if(_.contains((socketids)), room.people) {
                            sockets[i].leave(room.name);
                        }
                    }

                    if(_.contains((room.people)), s.id) {
                        for (var i=0; i<room.people.length; i++) {
                            people[room.people[i]].inroom = null;
                        }
                    }
                    delete rooms[people[s.id].owns];
                    people[s.id].owns = null;
                    room.people = _.without(room.people, s.id); //remove people from the room:people{}collection
                    delete chatHistory[room.name]; //delete the chat history
                    sizeRooms = _.size(rooms);
                    io.sockets.emit("roomList", {rooms: rooms, count: sizeRooms});
                }
            } else {//user in room but does not own room
                if (action === "disconnect") {
                    io.sockets.emit("update", {username:'Admin',text: people[s.id].name + "has disconnected from the server."});
                    if (_.contains((room.people), s.id)) {
                        var personIndex = room.people.indexOf(s.id);
                        room.people.splice(personIndex, 1);
                        s.leave(room.name);
                    }
                    delete people[s.id];
                    sizePeople = _.size(people);
                    io.sockets.emit("update-people", {people: people, count: sizePeople});
                    var o = _.findWhere(sockets, {'id': s.id});
                    sockets = _.without(sockets, o);
                } else if (action === "removeRoom") {
                    s.emit("update", {username:'Admin',text: "Only the owner can remove a room."});
                } else if (action === "leaveRoom") {
                    if (_.contains((room.people), s.id)) {
                        var personIndex = room.people.indexOf(s.id);
                        room.people.splice(personIndex, 1);
                        people[s.id].inroom = null;
                        io.sockets.emit("update", {username:'Admin',text: people[s.id].name + " has left the room."});
                        s.leave(room.name);
                    }
                }
            }
        } else {
            //The user isn't in a room, but maybe he just disconnected, handle the scenario:
            if (action === "disconnect") {
                io.sockets.emit("update", {username:'Admin',text: people[s.id].name + "has disconnected from the server."});
                delete people[s.id];
                sizePeople = _.size(people);
                io.sockets.emit("update-people", {people: people, count: sizePeople});
                var o = _.findWhere(sockets, {'id': s.id});
                sockets = _.without(sockets, o);
            }
        }
    }
});