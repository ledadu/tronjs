var _ = require('underscore');
//var world = require('./World');
var Players = function() {
    this.list={};   //list of Player
    //construct
}

Players.prototype.removeplayer = function (pp) {
        newplayers = {};
        _.each(this.list, function(p) {
            if (p.id != pp.id) {
                newplayers[p.id] = pp;
            }
        });
        this = newplayers;
    }
    
Players.prototype.spawnAll = function () {    
    _.each(this.list, function(p) {
        p.spawn();
    });
}

Players.prototype.countPlayerNotDead = function () { 
    countplayernotdead = 0;
    _.each(this.list, function(p) {	//todo _.find
        if (p.direction != "dead") {
            lastplayer = p;
            countplayernotdead++;
        }
    });
    if(countplayernotdead>1){
        return countplayernotdead;
    }else
    if(countplayernotdead==1){
        return 1
    }else
    if(countplayernotdead==0){
        return 0;
    }
}



module.exports = Players;
