const chatForm = document.getElementById('chat-form')
const chatVideo = document.querySelector('.chat-video')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

const {username,room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io()

socket.emit('join-room', {username,room})

socket.on('room-users', ({room,users}) => {
    outputRoomName(room)
    outputUsers(users)
})

socket.on('message', (message) => {
    outputMessage(message)
    chatMessages.scrollTop = chatMessages.scrollHeight
})

chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    let msg = e.target.elements.msg.value
    msg = msg.trim()

    if(!msg){
        return false
    }

    socket.emit('chat-message',msg)

    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');

    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += `<span>&nbsp;${message.time}</span>`;
    div.appendChild(p);

    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);

    document.querySelector('.chat-messages').appendChild(div);
  }

function outputRoomName(room){
    roomName.innerText = room
}

function outputUsers(users){
    userList.innerHTML = ''
    users.forEach(user => {
        const li = document.createElement('li')
        li.innerText = user.username
        userList.appendChild(li)
    });
}

function addVideo(){
    let video = document.createElement('video')

    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(stream => {
        video.srcObject = stream
        video.style.width = '100%'
        video.setAttribute('playsinline', 'true')
        video.setAttribute('autoplay', 'true')
      })

    chatVideo.append(video)
}

for(let i = 0; i < 6; i++){
    addVideo()
}

document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Leave room?')

    if(leaveRoom){
        window.location = '../index.html'
    }
})