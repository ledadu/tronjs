var _ = require('underscore');
var extend = require('extend');

var Bonus = function(params) {

    var Model_base = require('./entity');
    extend(true, this, new Model_base(params));

}


Bonus.prototype.routine = function() {
    return false;
}

module.exports = Bonus;

