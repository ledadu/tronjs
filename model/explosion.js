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
    var world  = this.getCollection().getParent();

        for (var x = this.x-3; x < this.x+3; x++) {
            for (var y = this.y-3; y < this.y+3; y++) {
                if (!_.isUndefined(world.bmp[x]) && !_.isUndefined(world.bmp[x])[y]) {
                    delete world.bmp[x][y];
                }
            }
        }

    
    world.ioNamespace.emit('initWorld', world.getdata());
    this.destroy();
    return true; 

}


module.exports = Explosion;

