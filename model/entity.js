var _ = require('underscore');
var extend = require('extend');

var Entity = function(params) {

    this.spawnParams = params || {};

    var Model_base = require('./base');
    extend(true, this, new Model_base());

    this.id    = this.makeid();
    this.directionlist = ["left", "right", "up", "down"];


    this.name = this.class + '-' + this.id;
}

Entity.prototype.spawn = function() {

    var world = this.getCollection().getParent();

    this.class     = this.spawnParams.class || null;
    this.direction = this.spawnParams.direction || _.sample(this.directionlist);
    this.x         = this.spawnParams.x || 1/4 * world.width / world.pixelReso  +  Math.floor((world.width / world.pixelReso * 1/2) * Math.random());
    this.y         = this.spawnParams.y || 1/4 * world.height / world.pixelReso  +  Math.floor((world.height / world.pixelReso * 1/2) * Math.random());
};



module.exports = Entity;

