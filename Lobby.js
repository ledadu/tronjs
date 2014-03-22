var BindSocketLobby = require('./BindSocketLobby');

var Lobby = function(io,worlds) {
    //construct
    this.worlds = worlds;
    this.ioNamespace = io;
};

// Socket
Lobby.prototype.initSocket = function() {
    var that = this;
    var player;


    that.ioNamespace     //.sockets

            .on('connection', function(socket) {
                player = new Player();
                socket.heartbeatTimeout = 5000;

                console.log('Got connect on lobby : !', player.id, player.name);


                var bindSocketLobby = new BindSocketLobby(socket, that);
                bindSocketPlayerWorld.bindDisconnect();

            });




    return this;
}

module.exports = Lobby;
