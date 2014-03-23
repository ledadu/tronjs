var _ = require('underscore');
var Player = require('./Player');
var Players = require('./Players');
var BindSocketPlayerWorld = require('./BindSocketPlayerWorld');


var World = function(io,idWorld) {
    //construct
    this.id = idWorld;
    this.width = 800;
    this.height = 400;
    this.bmp = [];
    this.pixelReso = 5;
    this.players = new Players();
    this.ioNamespace = io;
    this.gameMode = "DM"
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
    that.ioNamespace.emit('caneva', that.getdata());
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
	player.step++;
	
        switch (player.direction) {
            case "right":
                player.x ++;
                break;
            case "left":
                player.x --;
                break;
            case "up":
                player.y --;
                break;
            case "down":
                player.y ++;
                break;
        }

        if (that.bmp[player.x] == undefined) {
            that.bmp[player.x] = [];
        }
        if (player.direction != "dead")
            if (
                    player.x < 0 || player.x * that.pixelReso > that.width ||
                    player.y < 0 || player.y * that.pixelReso > that.height ||
                    that.bmp[player.x][player.y] != null
                    ) {
                player.kill();
//                socketplayer.broadcast.emit('showMessagesSreeen', {text: player.id + ' ☹', color: player.color});
//                socketplayer.emit('showMessagesSreeen', {text: player.id + ' ☹', color: player.color});
                that.ioNamespace.emit('showMessagesSreeen', {text: player.id + ' ☹', color: player.color});
            }

        that.bmp[player.x][player.y] = {playerid :player.id ,color:player.color};

        if (_.contains(player.directionlist, player.direction)) {
            that.players.list[player.id] = player;
//            socketplayer.broadcast.emit('playerUpdate', player);
//            socketplayer.emit('playerUpdate', player);
            that.ioNamespace.emit('playerUpdate', player);
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
World.prototype.initSocket = function() {
    var that = this;
    var player;


    that.ioNamespace     //.sockets

            .on('connection', function(socket) {
                player = new Player();
		player.on('playerMove', function(ppp) {
			console.log('playerMove',ppp.name);
		});
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


       

    return this;
}

module.exports = World;

