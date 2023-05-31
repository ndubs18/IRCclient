var socket = io('http://localhost:3000');
let roomList = document.getElementById('room-container');

let userList = document.getElementById('user-list');
let messages = document.getElementById('message-container');
let form = document.getElementById('send-container');
let input = document.getElementById('message-input');

let leaveLink = document.getElementById('leave-link');

let appendMessage = (msg) => {
    let item = document.createElement('li');
    item.innerHTML = msg;
    messages.appendChild(item);
}

let appendUser = (personName) => {
    let user = document.createElement('li');
    user.innerText = personName;
    userList.appendChild(user);
}

// Get username when user joins a room
let personName;
if(messages){
  personName = prompt("What is your name?")
};

if(personName === '') {
    alert("Enter in a valid name please");
    while(personName ==='') personName = prompt("What is your name?");
}

if(personName) {
    appendMessage('You joined')
    appendUser(personName);
    socket.emit('new-user', roomName, personName);
}

socket.on('user-disconnected', personName => {
    console.log(personName + ' has disconected');
    appendMessage(personName);
})

socket.on('user-connected', (users, personName) => {
    let item = document.createElement('li');
    item.textContent = personName;
    item.textContent += ' has joined';
    messages.appendChild(item);

    //when a another user joins loop over users list and add
    //the new user to the list
    for(user in users) {
        if(users[user] == personName)
        appendUser(users[user]);
    }

})


//when a room is created, add it too the room-container (room-list)
socket.on('room-created', room => {
  const roomElement = document.createElement('div');
  roomElement.innerText = room;
  const roomLink = document.createElement('a');
  roomLink.href = `/${room}`;
  roomLink.textContent = 'Join';
  roomElement.append(roomLink);
  roomList.append(roomElement);

})

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        appendMessage(personName + ': ' + input.value)
        socket.emit('send-chat-message', {roomName: roomName, name: personName, msg: input.value});
        input.value = '';
    }
});

socket.on('chat-message', msg => {
    
    let item = document.createElement('li');
    item.innerHTML = `<b>${msg.name}</b>: ${msg.msg}`;

    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

//leave room
leaveLink.addEventListener('click', (e) => {
    e.preventDefault();
    console.log("leaving...");
    socket.emit('user-left', roomName, socket.id);
    window.location.replace('/');
})
