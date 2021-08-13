let socket = io();
socket.on('connected', () => {
    console.log('Connected ' + socket.id)
})
let SelectedChannel ='';
let SelectedUserName='user'+socket.id;

function SetChannel(channel){
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
    console.log(reply.user+': '+ reply.message);
}
