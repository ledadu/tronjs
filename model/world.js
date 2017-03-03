var _ = require('underscore');
var extend = require('extend');
var Player = require('./player');
var Players = require('../collection/players');
var BindSocketPlayerWorld = require('../bind-socket-player-world');


var World = function(httpServer, io, idWorld) {

    var Model_base = require('./base');
    extend(true, this, new Model_base());

    //construct
    this.id = idWorld;
    this.width = 800;
    this.height = 800;
    this.bmp = [];
    this.pixelReso = 10;
    this.players = new Players();
    this.ioNamespace = io;
    this.httpServer = httpServer;
    this.gameMode = "DM";
    this.heartbeatPeriod = 5;
    this.heartbeat = 0; //refactor player.step??
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

        if (player == false) {
            return;
        }
//TODO????? manage collision entre 2 vers genre face a face => egualité!!!
        player.routine();
    });

    //Update clients
    this.ioNamespace.emit('playersUpdate', this.players.list);
    return this;

}

// routine for this world
World.prototype.serverRoutine = function() {
    var that             = this,
        nbPlayersPlaying = _.size(that.players.list),
        playersNotDead   = this.players.getPlayersNotDead();

    this.heartbeat++;

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
    }, this.heartbeatPeriod);
}


// Socket
World.prototype.initSocket = function() {
    var that = this;
    var player;


    that.ioNamespace     //.sockets

            .on('connection', function(socket) {
                console.log('## socket Io ##  (connection)');

                player = new Player({world : that, socket: socket});
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
                    player.getSocket().emit('initParam', {player_id: player.id});

                });

            });




    return this;
}

module.exports = World;

