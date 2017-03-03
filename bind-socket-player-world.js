var _ = require('underscore');

function BindSocketPlayerWorld(socket, world, player) {
    this.socket = socket;
    this.world = world;
    this.player = player;
}

BindSocketPlayerWorld.prototype.bindInput = function() {
    var that = this;
    that.socket.on('keydown', function(data) {
        console.log('keydown',data);
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
                that.world.ioNamespace.emit('playerQuit', that.player);

                that.player.name = data.value;
                if (that.world.players.list[that.player.id] != undefined) {
                    that.world.players.list[that.player.id] = that.player;
                }
                that.world.ioNamespace.emit('playerUpdate', that.player);
            }
        });

    });

}



BindSocketPlayerWorld.prototype.bindPrintDebug = function() {
    var that = this;
    that.socket.on('debug', function(data) {
        console.log(data);
    });
}


BindSocketPlayerWorld.prototype._executePlayerFunction = function(data) {
    var that = this;
    if (data.keyFunction != '') {

        //Two commands can't be same at suite
        if(_.last(this.player.commandPool) !== data.keyFunction) {
            this.player.commandPool.push(data.keyFunction);
        }

        //that.socket.emit('message', data.keyFunction);
    
        if (data.keyFunction == "clear") {
            this.player.activatePower = false;
            console.log("clear Bmp");
            that.world.bmp = [];
            that.world.ioNamespace.emit('caneva', that.world.getdata());
        }
    }
}


module.exports = BindSocketPlayerWorld;
