
var extend = require('extend');

var Players = function(options) {

    var Collection_base = require('./entities');
    extend(true, this, new Collection_base(options));

    this.on('add', function(player){player.initPlayerColor();})
};


Players.prototype.getPlayersNotDead = function() {

    var that = this;

    this.playersNotDead = this.filter(function(p){return p.direction != 'dead';});

    return this.playersNotDead;

};


module.exports = Players;
