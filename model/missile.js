var _ = require('underscore');
var extend = require('extend');

var Missile = function(params) {

    var Model_base = require('./entity');
    extend(true, this, new Model_base(params));

    this.color = {
        r: 255,
        g: 0,
        b: 0
    }
}


Missile.prototype.routine = function() {
    return false;
}

module.exports = Missile;

