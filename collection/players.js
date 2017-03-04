
var extend = require('extend');

var Players = function(options) {

    var Collection_base = require('./base');
    extend(true, this, new Collection_base(options));

};


Players.prototype.spawnAll = function (world) {
    this.each(function(p) {
        p.spawn(world);
    });
};

Players.prototype.getPlayersNotDead = function() {

    var that = this;

    this.playersNotDead = this.filter(function(p){return p.direction != 'dead';});

    return this.playersNotDead;

};


module.exports = Players;
