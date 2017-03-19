var _ = require('underscore');
var extend = require('extend');

var Explosion = function(params) {

    var Model_base = require('./entity');
    extend(true, this, new Model_base(params));

    this.color = {
        r: 255,
        g: 255,
        b: 0
    }

    this.creatorId = params.creatorId;

}


Explosion.prototype.routine = function() {

    this.move()
        .collisionTest();
    return true; 

}


module.exports = Explosion;

