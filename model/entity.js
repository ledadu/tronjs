var _ = require('underscore');
var extend = require('extend');

var Entity = function(params) {

    this.spawnParams = params || {};

    var Model_base = require('./base');
    extend(true, this, new Model_base());

    this.id    = this.makeid();
    this.directionlist = ["left", "right", "up", "down"];
    this.entityType = params.entityType || null;    
    this.step;

    this.name = this.class + '-' + this.id;
}

Entity.prototype.spawn = function() {

    var world = this.getCollection().getParent();

    this.step      = 0;
    this.class     = this.spawnParams.class || null;
    this.content   = this.spawnParams.content || null;
    this.direction = this.spawnParams.direction || _.sample(this.directionlist);
    this.x         = this.spawnParams.x || 1/4 * world.width / world.pixelReso  +  Math.floor((world.width / world.pixelReso * 1/2) * Math.random());
    this.y         = this.spawnParams.y || 1/4 * world.height / world.pixelReso  +  Math.floor((world.height / world.pixelReso * 1/2) * Math.random());
};

Entity.prototype.move = function() {

    //Move player
    switch (this.direction) {
        case "right":
            this.x ++;
            break;
        case "left":
            this.x --;
            break;
        case "up":
            this.y --;
            break;
        case "down":
            this.y ++;
            break;
    }

    return this;
}

Entity.prototype.collisionTest = function() {

    //Function to todge 'Too much recurstion'
    var world  = this.getCollection().getParent();

    if (this.direction != "dead"){

        //Manage player death colision
        if (
            this.x < 0 || this.x * world.pixelReso > world.width ||
            this.y < 0 || this.y * world.pixelReso > world.height ||
            !_.isUndefined(world.bmp[this.x]) && world.bmp[this.x][this.y] != null && world.bmp[this.x][this.y].color.solid
        ) {
            this.kill();
        }
    }

    return this;
};

Entity.prototype.kill = function() {
    this.direction = "dead";
    this.emit('kill',this);
};
module.exports = Entity;

