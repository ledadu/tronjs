var _ = require('underscore');

function BindSocketLobby(socket) {
    this.socket = socket;
}



BindSocketLobby.prototype.bindDisconnect = function() {
    var that = this;
    that.socket.on('disconnect', function() {
        console.log('World disconnect!', socket);
       
    });
}



module.exports = BindSocketLobby;
