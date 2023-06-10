var socket = io('http://localhost:3000');
let roomList = document.getElementById('room-container');

let userList = document.getElementById('user-list');
let messages = document.getElementById('message-container');
let form = document.getElementById('send-container');
let input = document.getElementById('message-input');

let disconnectBtn = document.getElementById('disconnectBtn');
let shutdownBtn = document.getElementById('shutdown');

let multipleRoomsBtn = document.getElementById('joinMultipleRooms');
let leaveLink = document.getElementById('leave-link');

let appendMessage = (msg) => {
    let item = document.createElement('li');
    item.innerHTML = msg;
    messages.appendChild(item);
}

let appendUser = (personName) => {
    let user = document.createElement('li');
    //add an id so we can remove from list by personName
    user.id = personName;
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

if(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value) {
            appendMessage(personName + ': ' + input.value)
            socket.emit('send-chat-message', {roomName: roomName, name: personName, msg: input.value});
            input.value = '';
        }
    })
}

socket.on('chat-message', msg => {
    let item = document.createElement('li');
    item.innerHTML = `<b>${msg.name}</b>: ${msg.msg}`;

    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
})

//leave room
if(messages) {
    leaveLink.addEventListener('click', (e) => {
        e.preventDefault();
        socket.emit('user-left', roomName, socket.id);
        window.location.replace('/');
    })
}


socket.on('user-left-message', (id, personName) => {
    //grab the li element from userList that we want to delete
    let toDelete = document.getElementById(personName);
    toDelete.remove();
    appendMessage(personName + ' has disconnected');
})

//index.ejs//

//when a room is created, add it too the room-container (room-list)
socket.on('room-created', room => {
    const roomElement = document.createElement('div');
    roomElement.innerText = room;

    //checkbox
    const roomSelector = document.createElement('input');
    roomSelector.type = 'checkbox';
    roomSelector.value = room;

    const roomLink = document.createElement('a');
    roomLink.href = `/${room}`;
    roomLink.textContent = 'Join';

    roomElement.prepend(roomSelector);
    roomElement.append(roomLink);
    roomList.append(roomElement);
  })

//Joining multiple rooms
multipleRoomsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let roomsToJoin = document.querySelectorAll("input[type='checkbox']:checked");
    
    let roomNameList = [];
    for(i = 0; i<roomsToJoin.length; ++i) {
        roomNameList.push(roomsToJoin[i].value);
    }
    socket.emit('join-multiple-rooms', roomNameList);
})

//leave server
disconnectBtn.addEventListener('click', () => {
    socket.emit('force-disconnect');
    alert('you have been disconnected from the server');
})

shutdownBtn.addEventListener('click', () => {
    socket.emit('close-server');
})

socket.on('server-shutdown', () => { 
    console.log('server is shutting down');
})

//if we have a connection error log it
socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});

socket.on("disconnect", (reason) => {
    console.log(reason);
  });


