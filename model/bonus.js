var _ = require('underscore');
var extend = require('extend');

var Bonus = function(options) {

    var Model_base = require('./base');
    extend(true, this, new Model_base());

    //Put in function to todge 'Too much recurstion'
    this.getWorld  = function(){return options.world;};
    this.getSocket = function(){return options.socket;};

}

Bonus.prototype.spawn = function() {
//    console.log(this.getCollection().getParent());
   // this.x = 1/4 * world.width / world.pixelReso  +  Math.floor((world.width / world.pixelReso * 1/2) * Math.random());
   // this.y = 1/4 * world.height / world.pixelReso  +  Math.floor((world.height / world.pixelReso * 1/2) * Math.random());
};

module.exports = Bonus;

