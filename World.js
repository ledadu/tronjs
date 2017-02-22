var _ = require('underscore');
var Player = require('./Player');
var Players = require('./Players');
var BindSocketPlayerWorld = require('./BindSocketPlayerWorld');


var World = function(httpServer, io, idWorld) {
    //construct
    this.id = idWorld;
    this.width = 800;
    this.height = 800;
    this.bmp = [];
    this.pixelReso = 2;
    this.players = new Players();
    this.ioNamespace = io;
    this.httpServer = httpServer;
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
    player.powerStep++;

    if (player.activatePower && player.powerStep > player.powerDuration) {
        player.activatePower = false;
        player.powerStep = 0;
    }

	if(player.step>player.speedStep){
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
		player.step=0;

	        if (that.bmp[player.x] == undefined) {
        	    that.bmp[player.x] = [];
	        }
	        if (player.direction != "dead")
        	    if (
	                    player.x < 0 || player.x * that.pixelReso > that.width ||
	                    player.y < 0 || player.y * that.pixelReso > that.height ||
	                    that.bmp[player.x][player.y] != null
	                    ) {
                    if (player.class == 'digger'){
                        if (!player.activatePower) {
        	                player.kill();
	                        that.ioNamespace.emit('showMessagesSreeen', {text: player.id + ' ☹', color: player.color});
                        }
                    } else {
    	                player.kill();
	                    that.ioNamespace.emit('showMessagesSreeen', {text: player.id + ' ☹', color: player.color});
                    }

	            }

            if (player.class == 'digger'){
                if (!player.activatePower) {
        	        that.bmp[player.x][player.y] = {playerid :player.id ,color:player.color};
                }
            } else {
        	    that.bmp[player.x][player.y] = {playerid :player.id ,color:player.color};
            }

	        if (_.contains(player.directionlist, player.direction)) {
	            that.players.list[player.id] = player;
	            that.ioNamespace.emit('playerUpdate', player);
	        }

	}
    });
}

// routine for this world
World.prototype.serverRoutine = function() {
    var that             = this,
        nbPlayersPlaying = _.size(that.players.list),
        playersNotDead   = this.players.getPlayersNotDead();

    if (nbPlayersPlaying >1 && playersNotDead.length == 1 ) {
        if (nbPlayersPlaying > 1) {
            playersNotDead[0].score++;
        }
        this.restartWorld();
    }

    if (nbPlayersPlaying == 1 && playersNotDead == 0) {

        this.restartWorld();
    }

    if (nbPlayersPlaying >=1) {

        that.playersRoutine();
    }

    setTimeout(function() {
        that.serverRoutine()
    }, 5);
}


// Socket
World.prototype.initSocket = function() {
    var that = this;
    var player;


    that.ioNamespace     //.sockets

            .on('connection', function(socket) {
                console.log('## socket Io ##  (connection)');

                player = new Player()
;
                var sid = that.httpServer.getSID(socket.request.headers.cookie);
                that.httpServer.getSessionFromSID(sid,function(err, session){
                    console.log('Session from ioNamespace @@->', JSON.stringify(session));
                    if(!_.isUndefined(session) && !_.isUndefined(session.name)){
                        player.name = session.name;
                    }
    		        player.speedStep = that.id;
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

            });




    return this;
}

module.exports = World;

