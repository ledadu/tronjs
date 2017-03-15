var _ = require('underscore');
var extend = require('extend');

var Missile = function(options) {

    options = options || {};

    var Model_base = require('./base');
    extend(true, this, new Model_base());

    this.id    = this.makeid();
    this.class = options.class;
    this.x     = options.x;
    this.y     = options.y;

    this.name = this.class + '-' + this.id;
}

Missile.prototype.spawn = function() {
    world = this.getCollection().getParent();
    this.x = 1/4 * world.width / world.pixelReso  +  Math.floor((world.width / world.pixelReso * 1/2) * Math.random());
    this.y = 1/4 * world.height / world.pixelReso  +  Math.floor((world.height / world.pixelReso * 1/2) * Math.random());
};


Missile.prototype.routine = function() {
    return false;
}

module.exports = Missile;

