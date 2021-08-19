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
let isLoggingEnabled = true;
let isEchoLogToAdmin = true;
let adminChannel = '12345678909876543212345678909876543212345678909876543212345678909876543210';
let suggestionList = [];
let suggestionLogs = [];

app.use('/', express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    socket.emit('connected');
    socket.on('subscribe',(v)=>{
        let userid = v.user+'@'+v.channel;
        if(!broadcastChannels.includes(v.channel))
        {
            if (!socketLogs.includes(userid) && (socketLogs[userid] == undefined || socketLogs[userid].timeStamp <= Date.now()))
            {
                Log('subscription request from '+ userid +': ' + v.message);
                socketLogs[userid] = {'timeStamp':Date.now()+60000,user:v.user,channel:v.channel};
                io.emit(adminChannel,v);
            }
            else
            {
                io.emit(v.channel,{user:'admin',event:'error',message:'Try again 1 minute after your last try.'});
            }
        }
        else
        {
            io.emit(v.channel, {user:'admin',event:'subscribed',message:'Already subscribed'});             
        }
    });

    socket.on(adminChannel, (v) => {
        try
        {
            switch(v.serverEvent)
            {
                case 'addChannel'://>>
                    if(!broadcastChannels.includes(v.clientChannel))
                    {
                        Log('channel added '+ v.clientChannel);
                        broadcastChannels.push(v.clientChannel);
                        io.on(v.clientChannel,onClientMessageReceived);
                        io.emit(v.clientChannel, {user:'admin',event:'subscribed',message:v.message}); 
                    }   
                    break;
                case 'removeChannel'://>>
                    ioRemoveChannel(v.clientChannel,v.message);
                    break;
                case 'getChannelList'://>>
                    io.emit(adminChannel,{event:'getChannelList',user:'admin',message:broadcastChannels});
                    break;
                case 'announcement'://>>
                    ioAdminBroadcast('announcement','admin',v.message);
                    break;
                case 'setPoll'://>>
                    ioAdminBroadcast('setPoll','admin',v.message);
                    break;
                case 'clearPoll'://>>
                    ioAdminBroadcast('clearPoll','admin',v.message);
                    break;
                case 'addHTMLElement'://>>
                    ioAdminBroadcast('addHTMLElement','admin',v.message);
                    break;
                case 'removeHTMLElement'://>>
                    ioAdminBroadcast('removeHTMLElement','admin',v.message);
                    break;
                case 'directMessage'://>>
                    ioDirectMessage('admin',v.clientChannel,v.message);
                    break;
                case 'echoLog'://>>
                    isEchoLogToAdmin = v.message == true || v.message == 'ON';
                    Log('isEchoLogToAdmin is '+ (isEchoLogToAdmin?'ON':'OFF'));
                    break;
                default:
                    break;
            }   
        }
        catch(e)
        {
            Log(e);
        }     
    });
});

function ioUserBroadcast(evnt,usr,msg){
    Log('broadcast from '+ usr +': ' + msg);
    broadcastChannels.forEach((chnl)=>io.emit(chnl, {event:evnt,user:usr,message:msg}));
}

function ioAdminBroadcast(evnt,msg)//<<
{
    broadcastChannels.forEach((chnl)=>io.emit(chnl, {user:'admin',event:evnt,message:msg}));
}

function ioDirectMessage(fromUsr,resipientId,msg)
{
    let resipient = socketLogs.find(s=>s.user == resipientId);
    io.emit(resipient.channel,{event:'directMessage',user:fromUsr,message:msg});
}

function ioRemoveChannel(clientChannel,msg)//>>
{
    if(broadcastChannels.includes(clientChannel))
    {
        Log('channel removed '+ clientChannel);
        broadcastChannels.splice(broadcastChannels.indexOf(clientChannel),1);
        io.removeListener(clientChannel);
        io.emit(clientChannel, {user:'admin',event:'unsubscribed',message:msg});
        
    }
}

function onClientMessageReceived(v){
    let userid = v.user+'@'+v.channel;
    if(broadcastChannels.includes(v.channel))
    {
        switch(v.message.event){
            case 'getSuggestionList':
                io.emit(v.channel,{event:'getSuggestionList',user:v.user,message:suggestionList});
                break;
            case 'setSuggestion':
                if(!suggestionLogs.includes(v.channel) || suggestionLogs[v.channel] <= Date.now())
                {
                    let suggestionId = Date.now()/60000;
                    suggestionLogs[v.channel] = Date.now()+10080000;//user can only make once every week
                    suggestionList[suggestionId] = {owner:v.channel,upVotes:0,downVotes:0};
                    ioUserBroadcast('setSuggestion',v.user,{isSuccess:true,suggestionId:suggestionId,message:v.message});
                }
                else
                {
                    io.emit(v.channel,{event:'setSuggestion',user:v.user,message:{isSuccess:false,message:'You can only make suggestion once a week.'}});
                }
                break;
            case 'clearSuggestion':
                if(suggestionList.includes(v.suggestionId) && suggestionList[v.suggestionId].owner == v.channel)
                {
                    suggestionList.splice(suggestionList.indexOf(v.suggestionId),1);
                    ioUserBroadcast('clearSuggestion',v.user,{isSuccess:true,message:v.message});
                }
                break;
            case 'upVoteSuggestion':
                if(suggestionList.includes(v.suggestionId))
                {
                    if(isVote)
                    {
                        suggestionList[v.suggestionId].votedChannels.push(v.channel);
                        suggestionList[v.suggestionId].upVotes++;
                    }
                    else if(suggestionList[v.suggestionId].votedChannels.includes(v.channel))
                    {
                        suggestionList[v.suggestionId].votedChannels.splice(suggestionList[v.suggestionId].votedChannels.indexOf(v.channel),1);
                        suggestionList[v.suggestionId].upVotes--;
                    }
                }
                break;
            case 'downVoteSuggestion':
                if(suggestionList.includes(v.suggestionId))
                {
                    if(v.isVote)
                    {
                        suggestionList[v.suggestionId].votedChannels.push(v.channel);
                        suggestionList[v.suggestionId].upVotes++;
                    }
                    else if(suggestionList[v.suggestionId].votedChannels.includes(v.channel))
                    {
                        suggestionList[v.suggestionId].votedChannels.splice(suggestionList[v.suggestionId].votedChannels.indexOf(v.channel),1);
                        suggestionList[v.suggestionId].upVotes--;
                    }
                }
                break;
            case 'directMessage':
                if(broadcastChannels.includes(v.channel) && broadcastChannels.includes(message.resipientId))
                {
                    ioDirectMessage(v.user,message.resipientId,message.message);
                    io.emit(v.channel,{event:'directMessage',user:v.user,message:{isSuccess:true,message:v.message}});
                }
                else
                {
                    io.emit(v.channel,{event:'directMessage',user:v.user,message:{isSuccess:false,message:'Either you or the resipient are not allowed.'}});
                }
                break;
            case 'message':
                Log('broadcast from '+ userid +': ' + v.message);
                socketLogs[userid].timeStamp = Date.now()/60000;
                broadcastChannels.forEach((chnl)=>io.emit(chnl, {user:v.user,event:'message',message:v.message}));
                break;
            default:
                break;
        }
        
    }
}

//Scan socketLogs every hour to remove (30min) inactive users
setInterval(function(){
    socketLogs.forEach(s=>{
        let timeNow = Date.now();
        if(s.timeStamp + 1800000 > timeNow)
        {
            ioRemoveChannel(s.channel,'Inactive users in more than 30min are automatically unsubscribed.');
        }
    });
},1800000);

function Log(msg){
    if(isLoggingEnabled){
        console.log(msg);
    }
    if(isEchoLogToAdmin)//<<
    {
        io.emit(adminChannel,{user:'log',event:'echoLog',message:msg});
    }
}

server.listen(SERVER_PORT, () => console.log('Website started on http://localhost:3333'))