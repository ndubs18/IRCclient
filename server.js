const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
// Allow any origin for testing purposes. This should be changed on production
const io = new Server(server, 
  {cors: { origin: '*', 
}},);

const port = process.env.PORT || 3000;

//body parser for form to create new rooms
app.use(express.urlencoded({extended: true}));

//setting up our folder to serve static files like our CSS style
app.use(express.static(__dirname));
//setting our view engine
app.set('view engine', 'ejs');

//rooms and users initializations
const rooms = { };
const users = { };

app.get('/', (req, res) => {
    res.render('index', { rooms: rooms });
});

app.post('/room', (req, res) => {
  if(rooms[req.body.room] != null) {
    return res.redirect('/');
  }
  rooms[req.body.room] = { users: {} };
  res.redirect(req.body.room);
  
  //send message that new room was created
  io.emit('room-created', req.body.room);
})

app.get('/:room', (req, res) => {
    if(!rooms[req.params.room]) {
      return res.redirect('/');
    }
    res.render('room', {roomName: req.params.room, users: rooms[req.params.room].users})
})

//socket.io server
io.on('connection', (socket) => {

  socket.on('disconnect', () => {
    //we don't need to emit a message for when anyone disconects
    //socket.emit('user-disconnected', users[socket.id]);
      delete users[socket.id];
      
  });
  socket.on('user-left', (roomName, id) => {
    delete rooms[roomName].users[id];
    socket.leave();
    socket.to(roomName).emit('user-left-message', id, users[id]);
  })

  socket.on('new-user', (room, name) => {
    users[socket.id] = name;

    rooms[room].users[socket.id] = name;

    //console.log(rooms);
    
    //place the socket in a room
    socket.join(room);
    socket.to(room).emit('user-connected', rooms[room].users, name);
  })

  socket.on('send-chat-message', (msg) => {
      // socket.broadcast.emit('chat-message', {msg: msg, name: users[socket.id]});
      socket.to(msg.roomName).emit('chat-message', msg);
     })
});

server.listen( port, () => {
  console.log('listening on port 3000');
});
