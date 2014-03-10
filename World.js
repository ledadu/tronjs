var _ = require('underscore');
var Player = require('./Player');
var Players = require('./Players');


var World = function(server) {
    //construct
    this.width = 800;
    this.height = 400;
    this.tcpPort = 8080;
    this.bmp = [];
    this.pixelReso = 5;
    this.players = new Players();
    this.server = server;
    this.io = require('socket.io').listen(this.server);
};

//  export World attributes
World.prototype.getdata = function() {
    var data = {
        width: this.width,
        height: this.height,
        bmp: this.bmp,
        pixelReso: this.pixelReso,
        players: this.players,
    }
    return data;
}

// clear world and spawn player
World.prototype.restartWorld = function() {
    this.bmp = [];
    console.log("restartWorld");
    that = this;
    that.io.sockets.emit('caneva', that.getdata());
    if (that.players != undefined) {
        that.players.spawnAll(that);
    }
}

// routine for all player in this world
World.prototype.playersRoutine = function() {
    var that = this;
    _.each(that.players.list, function(player) {
        if (player == false)
            return;
        switch (player.direction) {
            case "right":
                player.x += player.speed;
                break;
            case "left":
                player.x -= player.speed;
                break;
            case "up":
                player.y -= player.speed;
                break;
            case "down":
                player.y += player.speed;
                break;
        }

        if (that.bmp[player.x / that.pixelReso] == undefined) {
            that.bmp[player.x / that.pixelReso] = [];
        }
        if (player.direction != "dead")
            if (
                    player.x < 0 || player.x > that.width ||
                    player.y < 0 || player.y > that.height ||
                    that.bmp[player.x / that.pixelReso][player.y / that.pixelReso] != null
                    ) {
                player.kill();
                that.io.sockets.emit('showMessagesSreeen', {text: player.id + ' ☹', color: player.color});
            }

        that.bmp[player.x / that.pixelReso][player.y / that.pixelReso] = player.color;

        if (_.contains(player.directionlist, player.direction)) {
            that.players.list[player.id] = player;
            that.io.sockets.emit('playerUpdate', player);
        }
    });
}

// routine for this world
World.prototype.serverRoutine = function() {
    countplayernotdead = 0;
    that = this;
    if (_.size(that.players.list) > 1) {
        countplayernotdead = that.players.countPlayerNotDead();
        if (countplayernotdead == 0) {
            that.restartWorld();
        } else
        if (countplayernotdead.id != undefined) {
            that.restartWorld();
            if (_.size(that.players.list) > 1) {
                countplayernotdead.score++;
            }
        }

        that.playersRoutine();
    }
    setTimeout(function() {
        that.serverRoutine()
    }, 50);
}


// Socket 
World.prototype.initSocket = function(tcpPort) {
    var that = this;
    var player ;
    if (tcpPort != undefined) {
        that.tcpPort = tcpPort;
    }
    that.server.listen(that.tcpPort);
    that.io.configure('production', function() {
        that.io.set('log level', 1);
    });
    
    that.io.sockets.on('connection', function(socket) {
        player = new Player();
        socket.heartbeatTimeout = 5000;
        
        console.log('Got connect!', player.id, player.name);

        socket.emit('caneva', that.getdata());
        player.spawn(that);
        that.players.list[player.id] = player;


        bindSocketEvent(socket);

    });


    //  socket.on  socket.on socket.on socket.on socket.on socket.on socket.on

    function bindSocketEvent(socket) {
        socket.on('keydown', function(data) {
            executePlayerFunction(data, that);
        });

        socket.on('touchup', function(data) {
            executePlayerFunction(data, that);
        });

        socket.on('disconnect', function() {
            console.log('Got disconnect!', player.id, player.name);
            var newplayersList = {};
            _.each(that.players.list, function(p) {
                if (p.id != player.id) {
                    newplayersList[p.id] = p;
                }
            });
            that.players.list = newplayersList;
            that.io.sockets.emit('playerQuit', player);
            player = false;
        });

        socket.on('sendValue', function(data) {
            console.log('sendValue!', data);
            _.each(data, function(data) {
                if (data.name == 'nickname') {
                    oldplayerName = player.name;
                    that.io.sockets.emit('playerQuit', player);

                    player.name = data.value;
                    if (that.players.list[player.id] != undefined) {
                        that.players.list[player.id] = player;
                    }
                    that.io.sockets.emit('playerUpdate', player);

                }
            });

        });

        socket.on('printDebug', function(data) {
            console.log(data);
        });

        function executePlayerFunction(data, that) {
            if (data.keyFunction != '') {
                if (player.direction != "dead") {
                    if (_.contains(player.directionlist, data.keyFunction)) {
                        if (
                                (
                                        (data.keyFunction == "left" || data.keyFunction == "right") &&
                                        (player.direction == "up" || player.direction == "down")
                                        )
                                ||
                                (
                                        (data.keyFunction == "up" || data.keyFunction == "down") &&
                                        (player.direction == "left" || player.direction == "right")
                                        )
                                ) {
                            player.direction = data.keyFunction;
                            sendMessage(data.keyFunction);
                        }
                        return;
                    }

                }
                if (data.keyFunction == "clear") {
                    console.log("clear Bmp");
                    that.bmp = [];
                    that.io.sockets.emit('caneva', that.getdata());
                }
            }
        }

        function sendMessage(message) {
            socket.emit('message', message);
        }
    }


};

module.exports = World;


