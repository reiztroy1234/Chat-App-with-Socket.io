const express = require('express')
const path = require('path')
const socketio =  require('socket.io')
const http = require('http')

const SERVER_PORT = process.env.PORT || 3333

const app = express();
const server = http.createServer(app)
const io = socketio(server)

let usersockets = {}

app.use('/', express.static(path.join(__dirname, 'frontend')))

// this body of code runs for each socket
io.on('connection', (socket) => {
    console.log("New Socket formed from " + socket.id)
    socket.emit('connected')
    socket.on('login', (data) => {
        //username is in data.user
        usersockets[data.user] = socket.id
        console.log(usersockets)
    })
    // listener on the socket
    socket.on('send_msg', (data) => {
        //socket.broadcast only other will get it
        if (data.message.startsWith('@')) {
            let recipient = data.message.split(':')[0].substr(1)
            let rcpSocket = usersockets[recipient]
            io.to(rcpSocket).emit('recv_msg', data)
        } else {
            socket.broadcast.emit('recv_msg', data)   //io.emit means every socket which is connected will get the msg
        }
    })
})

server.listen(SERVER_PORT, () => console.log('Website started on http://localhost:3333'))