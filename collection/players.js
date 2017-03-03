var _ = require('underscore');
var Players = function() {
    //construct
    this.list = {};   //list of Player
};

Players.prototype.spawnAll = function (world) {
    _.each(this.list, function(p) {
        p.spawn(world);
    });
};

Players.prototype.getPlayersNotDead = function() {

    var that = this;

    this.playersNotDead = [];
    _.each(this.list, function(p) {	//todo _.find
        if (p.direction != "dead") {
            that.playersNotDead.push(p);
        }
    });

    return this.playersNotDead;

};


module.exports = Players;
