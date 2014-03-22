var _ = require('underscore');

function BindSocketLobby(socket,lobby) {
    this.socket = socket;
}



BindSocketLobby.prototype.bindDisconnect = function() {
    var that = this;
    that.socket.on('disconnect', function() {
        console.log('Lobby disconnect!', socket);
       
    });
}



module.exports = BindSocketLobby;
