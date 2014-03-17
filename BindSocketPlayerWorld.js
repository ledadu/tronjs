var _ = require('underscore');

function BindSocketPlayerWorld(socket, world, player) {
    this.socket = socket;
    this.world = world;
    this.player = player;
}

BindSocketPlayerWorld.prototype.bindInput = function() {
    var that = this;
    that.socket.on('keydown', function(data) {
        that._executePlayerFunction(data, that.world);
    });

    that.socket.on('touchup', function(data) {
        that._executePlayerFunction(data, that.world);
    });
}

BindSocketPlayerWorld.prototype.bindDisconnect = function() {
    var that = this;
    that.socket.on('disconnect', function() {
        console.log('Got disconnect!', that.player.id, that.player.name);
        var newplayersList = {};
        _.each(that.world.players.list, function(p) {
            if (p.id != that.player.id) {
                newplayersList[p.id] = p;
            }
        });
        that.world.players.list = newplayersList;
        that.socket.broadcast.emit('playerQuit', that.player);
        that.player = false;
    });
}


BindSocketPlayerWorld.prototype.bindSendValue = function() {
    var that = this;
    that.socket.on('sendValue', function(data) {
        console.log('sendValue!', data);
        _.each(data, function(data) {
            if (data.name == 'nickname') {
                oldplayerName = that.player.name;
//                that.socket.broadcast.emit('playerQuit', that.player);
//                that.socket.emit('playerQuit', that.player);
                that.world.ioNamespace.emit('playerQuit', that.player);

                that.player.name = data.value;
                if (that.world.players.list[that.player.id] != undefined) {
                    that.world.players.list[that.player.id] = that.player;
                }
//                that.socket.broadcast.emit('playerUpdate', that.player);
//                that.socket.emit('playerUpdate', that.player);
                that.world.ioNamespace.emit('playerUpdate', that.player);
            }
        });

    });

}



BindSocketPlayerWorld.prototype.bindPrintDebug = function() {
    var that = this;
    that.socket.on('printDebug', function(data) {
        console.log(data);
    });
}


BindSocketPlayerWorld.prototype._executePlayerFunction = function(data) {
    var that = this;
    if (data.keyFunction != '') {
        if (that.player.direction != "dead") {
            if (_.contains(that.player.directionlist, data.keyFunction)) {
                if (
                        (
                                (data.keyFunction == "left" || data.keyFunction == "right") &&
                                (that.player.direction == "up" || that.player.direction == "down")
                                )
                        ||
                        (
                                (data.keyFunction == "up" || data.keyFunction == "down") &&
                                (that.player.direction == "left" || that.player.direction == "right")
                                )
                        ) {
                    that.player.direction = data.keyFunction;
                    that.socket.emit('message', data.keyFunction);
                }
                return;
            }

        }
        if (data.keyFunction == "clear") {
            console.log("clear Bmp");
            that.world.bmp = [];
//            that.socket.broadcast.emit('caneva', that.world.getdata());
//            that.socket.emit('caneva', that.world.getdata());
            that.world.ioNamespace.emit('caneva', that.world.getdata());
        }
    }
}


module.exports = BindSocketPlayerWorld;
