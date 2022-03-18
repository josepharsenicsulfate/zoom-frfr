const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./helper/formatDate')
const {
    getActiveUser,
    exitRoom,
    newUser,
    getIndividualRoomUsers
} = require('./helper/userHelper')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', socket => {
    socket.on('join-room', ({username,room}) =>{
        const user = newUser(socket.id, username, room)
        socket.join(user.room)

        socket.emit('message', formatMessage('chat','welcome'))

        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage('chat',`${user.username} has joined the room`)
            )
        io.to(user.room).emit('room-users', {
            room: user.room,
            users: getIndividualRoomUsers(user.room)
        })
    })

    socket.on('chat-message', msg => {
        const user = getActiveUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    socket.on('disconnect', () => {
        const user = exitRoom(socket.id)

        if(user){
            io.to(user.room).emit(
                'message',
                formatMessage('chat',`${user.username} has left the room`)
            )

            io.to(user.room).emit('room-users', {
                room: user.room,
                users : getIndividualRoomUsers(user.room)
            })
        }
    })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log('Server is listening at ' + PORT))