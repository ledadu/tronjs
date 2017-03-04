var _ = require('underscore');
var extend = require('extend');

var Bonus = function(options) {

    options = options || {};

    var Model_base = require('./base');
    extend(true, this, new Model_base());

    this.id    = this.makeid();
    this.class = options.class;
    this.value = options.value;

    this.name = this.id;
    this.x = 50;
    this.y = 50;
}

Bonus.prototype.spawn = function() {
    world = this.getCollection().getParent();
    this.x = 1/4 * world.width / world.pixelReso  +  Math.floor((world.width / world.pixelReso * 1/2) * Math.random());
    this.y = 1/4 * world.height / world.pixelReso  +  Math.floor((world.height / world.pixelReso * 1/2) * Math.random());
};


Bonus.prototype.routine = function() {
    return false;
}

module.exports = Bonus;

