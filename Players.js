var _ = require('underscore');
var Players = function() {
    this.list={};   //list of Player
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
    
Players.prototype.spawnAll = function (world) {    
    _.each(this.list, function(p) {
        p.spawn(world);
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
        return lastplayer;
    }else
    if(countplayernotdead==0){
        return 0;
    }
}



module.exports = Players;
