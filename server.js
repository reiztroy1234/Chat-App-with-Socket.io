const express = require('express')
const path = require('path')
const socketio =  require('socket.io')
const http = require('http')

const SERVER_PORT = process.env.PORT || 3333

const app = express();
const server = http.createServer(app)
const io = socketio(server)

let broadcastChannels = [];
let socketLogs = [];

app.use('/', express.static(path.join(__dirname, 'public')));
io.on('connection', (socket) => {
    socket.emit('connected');
    socket.on('data', (v) => {
        
        if(broadcastChannels.includes(v.channel))
        {
            console.log('broadcast from '+ v.user+'@'+v.channel+': ' + v.message);
            socketLogs[v.user] = {'timeStamp':Date.now(),channel:v.channel};
            broadcastChannels.forEach((chnl)=>io.emit(chnl, {user:v.user,event:'message',message:v.message}));
        }
        else if (!socketLogs.includes(v.user) || socketLogs[v.user].timeStamp <= Date.now())
        {
            console.log('subscription request from '+ v.user+'@'+v.channel+': ' + v.message);
            socketLogs[v.user] = {'timeStamp':Date.now()+60000,channel:v.channel};
            io.emit('12345678909876543212345678909876543212345678909876543212345678909876543210',v);
        }
        else
        {
            io.emit(v.channel,{user:'admin',event:'error',message:'Try again 1 minute after your last try.'});
        }
    });

    socket.on('12345678909876543212345678909876543212345678909876543212345678909876543210', (v) => {
        switch(v.serverEvent)
        {
            case 'addChannel':
                if(!broadcastChannels.includes(v.clientChannel))
                {
                    console.log('channel added '+ v.clientChannel);
                    broadcastChannels.push(v.clientChannel);
                    io.emit(v.clientChannel, {user:'admin',event:'subscribed',message:v.message}); 
                }   
                break;
            case 'removeChannel':
                if(broadcastChannels.includes(v.clientChannel))
                {
                    console.log('channel removed '+ v.clientChannel);
                    broadcastChannels.splice(broadcastChannels.indexOf(v.clientChannel),1);
                    io.emit(v.clientChannel, {user:'admin',event:'unsubscribed',message:v.message});
                }
                break;
            default:
                break;
        }        
    });
});

//Scan socketLogs every hour to remove (30min) inactive users
setInterval(function(){
    socketLogs.forEach(s=>{
        let timeNow = Date.now();
        if(s.timeStamp + 1800000 > timeNow)
        {
            if(broadcastChannels.includes(s.channel))
            {
                broadcastChannels.splice(broadcastChannels.indexOf(s.channel),1);
                io.emit(s.channel, {user:'admin',event:'unsubscribed',message:'Inactive users in more than 30min are automatically unsubscribed.'});
            }
        }
    });
},1800000);

server.listen(SERVER_PORT, () => console.log('Website started on http://localhost:3333'))