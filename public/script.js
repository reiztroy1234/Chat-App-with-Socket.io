let socket = io();
socket.on('connected', () => {
    console.log('Connected ' + socket.id)
})
let SelectedChannel ='';
let SelectedUserName='user'+socket.id;
function Subscribe(){
    let addr= document.getElementById('address');
    if(addr && addr.value)
    {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var resp = JSON.parse(this.responseText);
                SelectedUserName = resp.ip;
                SetUserName(SelectedUserName.hashCode());
                SetChannel(addr.value);
                Send(addr.value);
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

function Send(msg){
    socket.emit('data', {
        channel:SelectedChannel,
        user: SelectedUserName,
        message:msg
    });
}

function onMessageReceived(reply){    
    if(reply && reply.evemt)
    {
        switch(reply.event){
            case 'subscribed':
                /*
                var s = document.createElement('script');
                s.type ='text/javascript';
                s.src = reply.message;
                document.getElementsByTagName('head')[0].append(s);  
                */
               console.log('subscribed');      
                break;
            case 'unsubscribed':
                alert('DISCONNECTED! ' + reply.message);
                break;
            case 'message':
                console.log(reply.message);
                break;
            case 'error':
                alert('ERROR! ' + reply.message);
                break;
            default:
                break;
        }
    }
    //console.log(reply.user+': '+ reply.message);
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