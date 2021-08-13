const express = require('express')
const path = require('path')
const socketio =  require('socket.io')
const http = require('http')

const SERVER_PORT = process.env.PORT || 3333

const app = express();
const server = http.createServer(app)
const io = socketio(server)

app.use('/', express.static(path.join(__dirname, 'public')))
io.on('connection', (socket) => {
    socket.emit('connected')
    socket.on('data', (v) => {
        io.emit(v.channel, {user:v.user,message:v.message});
    });
})

server.listen(SERVER_PORT, () => console.log('Website started on http://localhost:3333'))