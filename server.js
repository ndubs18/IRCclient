const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    // res.writeHead(200, { 'Content-Type': 'text/html' });
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user has disconnected');
    });

    socket.on('chat message', (msg) => {
        console.log(`${msg}`);
        io.emit('chat message', msg);
    })

  });

server.listen(port, () => {
  console.log('listening on port 3000');
});