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
const rooms = { room: {} };
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
    res.render('room', {roomName: req.params.room})
})

//socket.io server
io.on('connection', (socket) => {

  socket.on('disconnect', () => {
    //console.log('user has disconnected');
      socket.emit('user-disconnected', users[socket.id]);
      delete users[socket.id];
  });

  socket.on('new-user', (room, name) => {
    users[socket.id] = name;
    
    //place the socket in a room
    socket.join(room);
  
    // socket.broadcast.emit('user-connected', name);
    socket.to(room).emit('user-connected', name);
  
  })

  socket.on('send-chat-message', (msg) => {
      // socket.broadcast.emit('chat-message', {msg: msg, name: users[socket.id]});
      socket.to(msg.roomName).emit('chat-message', msg);
      //io.emit('chat message', msg);
     })
});

server.listen( port, () => {
  console.log('listening on port 3000');
});

//let other devices on the network connect with that hostname (ip address)
// server.listen( port, '192.168.1.18', () => {
//   console.log('listening on port 3000');
// });



// server.listen( port, '172.31.42.251', () => {
//   console.log('listening on port 3000');
// });