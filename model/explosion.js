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
    
    this.step++;

    var world       = this.getCollection().getParent(),
        radius      = Math.round((this.step/world.pixelReso)),
        bmpToDelete = [];

    for (var x = this.x-radius; x < this.x+radius; x++) {
        for (var y = this.y-radius; y < this.y+radius; y++) {
            if (!_.isUndefined(world.bmp[x]) && !_.isUndefined(world.bmp[x])[y]) {
                delete world.bmp[x][y];
                bmpToDelete.push({x:x,y:y,content:null});
            }
        }
    }
    
    world.ioNamespace.emit('updateBmpPixels', bmpToDelete);

    if (radius >=3) {
        this.destroy();
    }
    return true; 

}


module.exports = Explosion;

