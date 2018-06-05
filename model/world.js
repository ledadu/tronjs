
var _          = require('underscore');
var extend     = require('extend');

var Player     = require('./player');
var Bonus      = require('./bonus');
var Missile    = require('./missile');
var Laser      = require('./laser');
var Explosion  = require('./explosion');
var Players    = require('../collection/players');
var Boni       = require('../collection/boni');
var Missiles   = require('../collection/missiles');
var Lasers     = require('../collection/lasers');
var Explosions = require('../collection/explosions');

var BindSocketPlayerWorld = require('../bind-socket-player-world');

var World = function(httpServer, io, idWorld) {

    var Model_base = require('./base');
    extend(true, this, new Model_base());

    //construct
    this.id = idWorld;
    this.width       = 2000;
    this.height      = 2000;
    this.pixelReso   = 5; 
    this.bmp         = [];
    this.players     = new Players({parent: this});
    this.boni        = new Boni({parent:this});
    this.missiles    = new Missiles({parent:this});
    this.lasers      = new Lasers({parent:this});
    this.explosions  = new Explosions({parent:this});
    this.ioNamespace = io;
    this.httpServer  = httpServer;
    this.gameMode    = "DM";
    this.heartbeat   = 0;
    
    this.on('spawn', function(params){
        if (params.type === 'missile') {this.spawnMissile(params);}
        if (params.type === 'laser') {this.spawnLaser(params);}
        if (params.type === 'explosion') {this.spawnExplosion(params);}
    });
};


//  export World attributes
World.prototype.getdata = function() {
    var data = {
        width: this.width,
        height: this.height,
        bmp: this.bmp,
        pixelReso: this.pixelReso,
    }
    return data;
};

// clear world and spawn player
World.prototype.restartWorld = function() {
    
    this.heartbeat = 0;

    this.bmp = [];

    console.log("restartWorld");
    this.ioNamespace.emit('initWorld', this.getdata());
    if (!_.isUndefined(this.players)) {
        this.players.spawnAll(this);
    }

    this.boni       = new Boni({parent: this});
    this.missiles   = new Missiles({parent: this});
    this.explosions = new Missiles({parent: this});

};

//Spawn missile
World.prototype.spawnMissile = function(params) {
    this.missiles.add(new Missile(params));
};

//Spawn explosion
World.prototype.spawnExplosion = function(params) {
    this.explosions.add(new Explosion(params));
};

//Spawn laser
World.prototype.spawnLaser = function(params) {
    this.lasers.add(new Laser(params));
};


// routine for this world
World.prototype.serverRoutine = function() {
    var that             = this,
        nbPlayersPlaying = that.players.size(),
        playersNotDead   = this.players.getPlayersNotDead(),
        relaunch         = function() {
            if (nbPlayersPlaying === 0) {
                that.heartbeat = 0;
                return;
            }
            setTimeout(function() {
                that.serverRoutine()
            }, (12 -that.id)); // nb world max + 2
        };

    if (nbPlayersPlaying >1 && playersNotDead.size() == 1 ) {
        if (nbPlayersPlaying > 1) {
            playersNotDead.at(0).score++;
        }
        this.restartWorld();
    }

    if (nbPlayersPlaying == 1 && playersNotDead.size() == 0) {

        this.restartWorld();
    }

    if (nbPlayersPlaying >=1) {

        this.heartbeat++;

        //Update clients
        var clientsMustBeUpdated = false;
        
        clientsMustBeUpdated |= this.playersRoutine();
        clientsMustBeUpdated |= this.boniRoutine();
        clientsMustBeUpdated |= this.missilesRoutine();
        clientsMustBeUpdated |= this.explosionsRoutine();
        clientsMustBeUpdated |= this.lasersRoutine();

        if (this.heartbeat === 1 || clientsMustBeUpdated) {
            //emit just when players are upbated
            this.ioNamespace.emit('entitiesUpdate', {
                players    : this.players.list,
                boni       : this.boni.list,
                missiles   : this.missiles.list,
                lasers     : this.lasers.list,
                explosions : this.explosions.list,
            });
            this.missiles.filterRemove(function(missile){return missile.direction === 'dead';});
        }

    }

    relaunch();

    return this;
};

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

};

//Routine for all boni in this world
World.prototype.boniRoutine = function() {
    var that = this,
        aBonusHasBeenUpdated = false;

    if (this.heartbeat % 100 === 0) {
        this.boni.addRandom();
        this.ioNamespace.emit('boniUpdate', this.boni.list);
    }

    this.boni.each(function(bonus) {
        if (bonus == false) {
            return;
        }

        aBonusHasBeenUpdated = aBonusHasBeenUpdated || bonus.routine(); 
    });

    return aBonusHasBeenUpdated;

};

//Routine for all missiles in this world
World.prototype.missilesRoutine = function() {
    var that = this,
        aMissileHasBeenUpdated = false;

    this.missiles.each(function(missile) {
        if (missile == false) {
            return;
        }
        aMissileHasBeenUpdated = aMissileHasBeenUpdated || missile.routine(); 
    });


    return aMissileHasBeenUpdated;

};


//Routine for all lasers in this world
World.prototype.lasersRoutine = function() {
    var that = this,
        aMissileHasBeenUpdated = false;

    this.lasers.each(function(laser) {
        if (laser == false) {
            return;
        }
        aMissileHasBeenUpdated = aMissileHasBeenUpdated || laser.routine(); 
    });


    return aMissileHasBeenUpdated;

};

//TODO RAFACTOR routinnnnnnnnnnne

//Routine for all explosion in this world
World.prototype.explosionsRoutine = function() {
    var that = this,
        aMissileHasBeenUpdated = false;

    this.explosions.each(function(missile) {
        if (missile == false) {
            return;
        }
        aMissileHasBeenUpdated = aMissileHasBeenUpdated || missile.routine(); 
    });


    return aMissileHasBeenUpdated;

};

// Socket
World.prototype.initSocket = function() {
    var that = this;
    var player;


    that.ioNamespace     //.sockets

            .on('connection', function(socket) {
                console.log('## socket Io ##  (connection)');

                player = new Player();
                player.getSocket = function(){return socket;}; //protect frm too mush recursion

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

                    socket.emit('initWorld', that.getdata());

                    that.players.add(player);

                    var bindSocketPlayerWorld = new BindSocketPlayerWorld(socket, that, player);
                    bindSocketPlayerWorld.bindInput();
                    bindSocketPlayerWorld.bindSendValue();
                    bindSocketPlayerWorld.bindPrintDebug();
                    bindSocketPlayerWorld.bindDisconnect();
                    player.getSocket().emit('initParam', {player_id: player.id});
                    if (that.players.size() === 1)  {
                        that.serverRoutine();
                    }
                });

            });




    return this;
};

module.exports = World;

