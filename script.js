let socket = io();
socket.on('connected', () => {
    console.log('Connected ' + socket.id)
})
let SelectedChannel ='';
let SelectedUserName='user'+socket.id;

function SetChannel(channel){
    socket.removeListener(SelectedChannel);
    SelectedChannel = channel;    
    socket.on(SelectedChannel, (message) => {
        onMessageReceived(message);
    });
}
function SetUserName(username){
    SelectedUserName = username;
}


function SendEvent(evnt,msg){
    socket.emit(SelectedChannel, {
        event:evnt,
        channel:SelectedChannel,
        user: SelectedUserName,
        message:msg
    });
    console.log('MessageSent: ' + '['+JSON.stringify(evnt)+']:' + JSON.stringify(msg));
}
function SendServerEvent(evnt,clientChannel,msg){
    socket.emit(SelectedChannel, {
        serverEvent:evnt,
        user:SelectedUserName,
        cientChannel:clientChannel,
        user: SelectedUserName,
        message:msg
    });
}


function Subscribe()
{
    SetUserName('admin');
    SetChannel('12345678909876543212345678909876543212345678909876543212345678909876543210');
}

function TurnEchoLog(isON){
    socket.emit(SelectedChannel,{'serverEvent':'echoLog',message:isON});
}

function AddChannel(clientChannel,msg){
    SendServerEvent('addChannel',clientChannel,msg);
}

function RemoveChannel(clientChannel,msg){
    SendServerEvent('removeChannel',clientChannel,msg);
}

function GetChannelList(){
    SendServerEvent('getChannelList',{},{});
}
function Announcement(msg){
    SendServerEvent('announcement',{},msg);
}

function SetPoll(msg){
    SendServerEvent('setPoll',{},msg);
}

function ClearPoll(pollId){
    SendServerEvent('clearPoll',{},pollId);
}

function AddHTMLElement(msg){
    SendServerEvent('addHTMLElement',{},msg);
}

function RemoveHTMLElement(elementId){
    SendServerEvent('removeHTMLElement',{},elementId);
}


function Message(msg){
    SendEvent('message',msg);
}
function GetSuggestionList(){
    SendEvent('getSuggestionList',SelectedUserName);
}
function SetSuggestion(suggestion){
    SendEvent('setSuggestion',suggestion);
}
function ClearSuggestion(suggestionId){
    SendEvent('clearSuggestion',suggestionId);
}
function UpVoteSuggestion(suggestionId){
    SendEvent('upVoteSuggestion',suggestionId);
}
function DownVoteSuggestion(suggestionId){
    SendEvent('downVoteSuggestion',suggestionId);
}
function DirectMessage(resipientId,message){
    SendEvent('directMessage',{resipientId:resipientId,message:message});
}
function onMessageReceived(reply){    
    if(reply && reply.event)
    {
        switch(reply.event){
            case 'subscribed':
                /*
                var s = document.createElement('script');
                s.type ='text/javascript';
                s.src = reply.message;
                document.getElementsByTagName('head')[0].append(s);  
                */
               //console.log('subscribed');      
                break;
            case 'unsubscribed':
                //alert('DISCONNECTED! ' + reply.message);
                break;
            case 'message':
                //console.log(reply.message);
                break;
            case 'error':
                //alert('ERROR! ' + reply.message);
                break;
            case 'getSuggestionList':
                //SendEvent('getSuggestionList',{event:'getSuggestionList',user:v.user,message:suggestionList});
                break;
            case 'setSuggestion':
                break;
            case 'clearSuggestion':
                break;
            case 'upVoteSuggestion':
                break;
            case 'downVoteSuggestion':
                break;
            case 'directMessage':
                break;
            default:
                break;
        }
    }
    console.log(reply.user+': '+ reply.message);
}

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };