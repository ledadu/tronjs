var _ = require('underscore');
var Player = require('./Player');
var Players = require('./Players');

var fs = require('fs');




var World = function() {
    this.width = 800;
    this.height = 400;
    this.bmp = [];
    this.pixelReso = 5;
    this.players = new Players();
    this.app = require('http').createServer(handler);    
    this.io = require('socket.io').listen(this.app); 
    this.app.listen(8181);

};




World.prototype.getdata = function() {
        var data = {
            width  : this.width,
            height : this.height,
            bmp : this.bmp ,
            pixelReso : this.pixelReso ,
            players : this.players,
        }
   return data;
}


World.prototype.clearWorld = function() {
    this.bmp = [];
  
    this.io.sockets.emit('caneva', world);
    if(this.players!=undefined){
        this.players.spawnAll();   
    }
}

World.prototype.playerRoutine = function() {
    var world = this;
    _.each(this.players.list, function(player) {
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
        console.log(world.bmp);
        if (world.bmp[player.x / world.pixelReso] == undefined) {
            world.bmp[player.x / world.pixelReso] = [];
        }
        if (player.direction != "dead")
            if (
                    player.x < 0 || player.x > world.width ||
                    player.y < 0 || player.y > world.height ||
                    world.bmp[player.x / world.pixelReso][player.y / world.pixelReso] != null
                    ) {
                player.kill();
                this.io.sockets.emit('showMessagesSreeen', {text: player.id + ' ☹', color: player.color});
            }

        world.bmp[player.x / world.pixelReso][player.y / world.pixelReso] = player.color;

        if (_.contains(player.directionlist, player.direction)) {
            world.players.list[player.id] = player;
            this.io.sockets.emit('playerUpdate', player);
        }
    });
}

module.exports = World;

World.prototype.serverRoutine = function() {
    countplayernotdead = 0;
    if(this.players!=undefined){
        countplayernotdead = this.players.countPlayerNotDead();
    }
    if(countplayernotdead <= 1){
        this.clearWorld();
        if (countplayernotdead.id!=undefined) {            
            if (_.size(this.players.list) > 1) {
                countplayernotdead.score++;
            } 
        }        
    }else{
        this.playerRoutine();        
    }

    setTimeout(serverRoutine, 50);
}

World.prototype.initSocket = function() {
    console.log(this.height);
    var that = this;
    that.io.configure('production', function() {
        that.io.set('log level', 1);
    });
    that.io.sockets.on('connection', function(socket){       
        
        socket.heartbeatTimeout = 5000;
        var player = new Player();
        console.log('Got connect!', player.id, player.name);

        socket.emit('caneva', that.getdata());
        player.spawn();
        that.players.list[player.id] = player;

        //  socket.on  socket.on socket.on socket.on socket.on socket.on socket.on

        socket.on('keydown', function(data) {
            takePlayerFunction(data);
        });

        socket.on('touchup', function(data) {
            takePlayerFunction(data,that);
        });

        socket.on('disconnect', function() {
            console.log('Got disconnect!', player.id, player.name);
            var newplayers = {};
            _.each(that.players.list, function(p) {
                if (p.id != player.id) {
                    newplayers[p.id] = p;
                }
            });
            that.players = newplayers.list;
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



        function takePlayerFunction(data,that) {
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


    
    });
    


};




function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
            function(err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading index.html');
                }
                console.log(req.url);
                res.writeHead(200);
                res.end(data);
            });

}
