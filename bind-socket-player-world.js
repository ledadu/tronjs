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
        that.world.players.remove(that.player);
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
                that.world.ioNamespace.emit('playerQuit', that.player);

                that.player.name = data.value;
                if (that.world.players.list[that.player.id] != undefined) {
                    that.world.players.list[that.player.id].name = data.value;
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
