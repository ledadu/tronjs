var _ = require('underscore');
var Player = require('./Player');
var Players = require('./Players');
var BindSocketPlayerWorld = require('./BindSocketPlayerWorld');


var World = function(server) {
    //construct
    this.width = 800;
    this.height = 400;
    this.tcpPort = 8080;
    this.bmp = [];
    this.pixelReso = 5;
    this.players = new Players();
    this.server = server;
    this.io = require('socket.io').listen(server);
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
    var that = this;
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
    var that = this;
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
    
    that.io.sockets
		//.of(namespace)
		.on('connection', function(socket) {
        player = new Player();
        socket.heartbeatTimeout = 5000;
        
        console.log('Got connect!', player.id, player.name);

        socket.emit('caneva', that.getdata());
        player.spawn(that);
        that.players.list[player.id] = player;

        var bindSocketPlayerWorld = new BindSocketPlayerWorld(socket, that, player);
        bindSocketPlayerWorld.bindInput();        
        bindSocketPlayerWorld.bindSendValue();
        bindSocketPlayerWorld.bindPrintDebug();
        bindSocketPlayerWorld.bindDisconnect();

    });
    
    }

module.exports = World;

