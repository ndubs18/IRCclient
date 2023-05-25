var socket = io('http://localhost:3000');

var messages = document.getElementById('message-container');
var form = document.getElementById('send-container');
var input = document.getElementById('message-input');
let roomList = document.getElementById('room-container');

let personName;
if(messages){
  personName = prompt("What is your name?")
};

if(personName === '') {
    alert("Enter in a valid name please");
    while(personName ==='') personName = prompt("What is your name?");
}

if(personName) {
    socket.emit('username', personName);
}

socket.on('username', personName => {
    let item = document.createElement('li');
    item.textContent = personName;
    item.textContent += ' has joined';
    messages.appendChild(item);
})

socket.on('room-created', room => {
  const roomElement = document.createElement('div');
  roomElement.innerHTML = room;
  const roomLink = document.createElement('a');
  roomLink.href = `/${room}`;
  roomLink.innerHTML = 'Join';
  roomList.append(roomElement);
  roomList.append(roomLink); 
})

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
    }
});

socket.on('chat message', msg => {
    var item = document.createElement('li');
    item.textContent = `${msg}`;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});