
var _       = require('underscore');
var extend  = require('extend');

var Player  = require('./player');
var Players = require('../collection/players');
var Bonus   = require('./bonus');
var Boni    = require('../collection/boni');

var BindSocketPlayerWorld = require('../bind-socket-player-world');


var World = function(httpServer, io, idWorld) {

    var Model_base = require('./base');
    extend(true, this, new Model_base());

    //construct
    this.id = idWorld;
    this.width = 800;
    this.height = 600;
    this.bmp = [];
    this.pixelReso = 5; 
    this.players = new Players({parent: this});
    this.boni    = new Boni({parent:this});
    this.ioNamespace = io;
    this.httpServer = httpServer;
    this.gameMode = "DM";
    this.heartbeat = 0;
};

//  export World attributes
World.prototype.getdata = function() {
    var data = {
        width: this.width,
        height: this.height,
        bmp: this.bmp,
        pixelReso: this.pixelReso,
        players: this.players,
        boni: this.boni,
    }
    return data;
}

// clear world and spawn player
World.prototype.restartWorld = function() {
    
    this.heartbeat = 0;

    this.bmp = [];
    console.log("restartWorld");
    console.log(this.bmp);
    this.ioNamespace.emit('caneva', this.getdata());
    if (!_.isUndefined(this.players)) {
        this.players.spawnAll(this);
    }

    this.boni = new Boni({parent: this});

}

// routine for this world
World.prototype.serverRoutine = function() {
    var that             = this,
        nbPlayersPlaying = _.size(that.players.list),
        playersNotDead   = this.players.getPlayersNotDead(),
        relaunch         = function() {
            setTimeout(function() {
                that.serverRoutine()
            }, (12 -that.id)); // nb world max + 2
        }



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

        this.heartbeat++;

        //Update clients
        if (this.playersRoutine()) {
            //emit just when players are upbated
            this.ioNamespace.emit('playersUpdate', this.players.list);
        }

        if (this.heartbeat === 1 || this.boniRoutine()) {
            //emit just when players are upbated
            this.ioNamespace.emit('boniUpdate', this.boni.list);

        }
    }

    relaunch();

    return this;
}

// routine for all player in this world
World.prototype.playersRoutine = function() {
    var that = this,
        aPlayerHasBeenUpdated = false;

    this.players.each(function(player) {
        if (player == false) {
            return;
        }
//TODO????? manage collision entre 2 vers genre face a face => egualité!!!
//kill sametime player a same coordonate
        var playerUpdated = player.routine();
        aPlayerHasBeenUpdated = aPlayerHasBeenUpdated || playerUpdated; 
    });

    return aPlayerHasBeenUpdated;

}

//Routine for all boni in this world
World.prototype.boniRoutine = function() {
    var that = this,
        aBonusHasBeenUpdated = false;

    if (this.heartbeat % 1000 === 0) {
        this.boni.addRandom();
        this.ioNamespace.emit('boniUpdate', this.boni.list);
    }

    this.boni.each(function(bonus) {
        if (bonus == false) {
            return;
        }

        var bonusUpdated = bonus.routine();
        aBonusHasBeenUpdated = aBonusHasBeenUpdated || bonusUpdated; 
    });

    return aBonusHasBeenUpdated;

}



// Socket
World.prototype.initSocket = function() {
    var that = this;
    var player;


    that.ioNamespace     //.sockets

            .on('connection', function(socket) {
                console.log('## socket Io ##  (connection)');

                player = new Player({socket: socket});
                var sid = that.httpServer.getSID(socket.request.headers.cookie);
                that.httpServer.getSessionFromSID(sid,function(err, session){
                    console.log('Session from ioNamespace @@->', JSON.stringify(session));
                    if(!_.isUndefined(session) && !_.isUndefined(session.name)){
                        player.name = session.name;
                    }
                    //useless ??
            		player.on('playerMove', function(ppp) {
		            	console.log('playerMove',ppp.name);
        	    	});
                    socket.heartbeatTimeout = 5000;

                    console.log('Got connect!', player.id, player.name);

                    socket.emit('caneva', that.getdata());

                    socket.emit('boniUpdate', that.boni.list);
                    
                    that.players.add(player);
                    player.spawn(that);

                    var bindSocketPlayerWorld = new BindSocketPlayerWorld(socket, that, player);
                    bindSocketPlayerWorld.bindInput();
                    bindSocketPlayerWorld.bindSendValue();
                    bindSocketPlayerWorld.bindPrintDebug();
                    bindSocketPlayerWorld.bindDisconnect();
                    player.getSocket().emit('initParam', {player_id: player.id});

                });

            });




    return this;
}

module.exports = World;

