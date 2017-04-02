var _ = require('underscore');
var extend = require('extend');

var Missile = function(params) {

    params = params || {};
    params.entityType = 'missile';

    var Model_base = require('./entity');
    extend(true, this, new Model_base(params));

    this.color = {
        r: 255,
        g: 0,
        b: 0
    }

    this.playerId = params.playerId;

    this.on('kill',function(){
        var world = this.getCollection().getParent();
        world.ioNamespace.emit('showMessagesSreeen',{text: 'entity kill : ' + this.class, color:this.color});
        world.emit('spawn',{type:'explosion', x:this.x, y:this.y, creatorId: this.id});
    });
}


Missile.prototype.routine = function() {

    var that  = this,
        world = this.getCollection().getParent();

    this.move()
        .collisionTest(this.x,this.y);

    return true; 

}


module.exports = Missile;

