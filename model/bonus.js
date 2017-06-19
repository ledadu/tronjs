var _ = require('underscore');
var extend = require('extend');

var Bonus = function(params) {

    params = params || {};
    params.entityType   = 'bonus';
    params.isCollidable = false;

    var Model_base = require('./entity');
    extend(true, this, new Model_base(params));

    /**
    * Overwirite Entity.spawn
    */
    this.spawn = function() {

        var world = this.getCollection().getParent();

        this.step      = 0;
        this.class     = this.spawnParams.class || null;
        this.content   = this.spawnParams.content || null;
        this.direction = this.spawnParams.direction || _.sample(this.directionlist);
        this.x         = this.spawnParams.x || Math.floor((world.width / world.pixelReso) * Math.random());
        this.y         = this.spawnParams.y || Math.floor((world.height / world.pixelReso) * Math.random());
       
        if(!_.isUndefined(world.bmp[this.x]) && !_.isUndefined(world.bmp[this.x][this.y])) {
            world.bmp[this.x][this.y] = null;
        } 
        
    console.log(this.class,this.content);

    };

}



Bonus.prototype.routine = function() {
    return false;
}

module.exports = Bonus;

