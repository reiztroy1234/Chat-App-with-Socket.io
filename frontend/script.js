let socket = io();  // we will leave io() empty bcz the server is same through which our webpage is serving
socket.on('connected', () => {
    console.log('Connected ' + socket.id)
})
// console.log("Socket formed on " + socket.id)
/*
$(function() {
    let user = 'user'+Date.now;
    let channel = '1'
    sendbtn.click(function () {
        socket.emit('data', {
            user: user,
            channel:channel,
            message: msg})
    })

    loginbtn.click(function () {
        user = loginbox.val()
        chatDiv.show()
        loginDiv.hide()
        socket.emit('login', {
            user: user
        })
    })

    socket.on(channel, function (data) {
        msglist.append($('<li>' + data.user + ': ' + data.message + '</li>'))
    })
})
*/
let SelectedChannel ='';

function SetChannel(channel){
    SelectedChannel = channel;
    socket.on(SelectedChannel, (message) => {
        onMessageReceived(message);
    });
}
function Send(msg){
    socket.emit('data', {
        channel:SelectedChannel,
        message:msg
    });
}

function onMessageReceived(reply){
    console.log('<< '+ reply);
}
