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
    console.log('MessageSent: ' + '['+evnt+']:' + msg);
}

function Subscribe()
{
    let addr= document.getElementById('address');
    if(addr && addr.value)
    {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var resp = JSON.parse(this.responseText);
                console.log('Your ip is '+resp.ip);
                SelectedUserName = resp.ip;
                SetUserName(SelectedUserName.hashCode());
                SetChannel(addr.value);
                Send('subscribe',addr.value);
            }
        };
        xmlhttp.open("GET", 'https://api.ipify.org?format=json', true);
        xmlhttp.send();
    }
    else
    {
        alert('Invalid Address');
    }
}

function UnSubscribe(){
    SendEvent('unsubscribe','Have a nice day!');
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