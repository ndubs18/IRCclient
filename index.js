import { io } from "socket.io-client";
var socket = io();

var messages = document.getElementById('message-container');
var form = document.getElementById('send-container');
var input = document.getElementById('message-input');

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

socket.on('chat message', function(msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});