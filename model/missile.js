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

    this.on('kill',function(){
        var world = this.getCollection().getParent();
        world.ioNamespace.emit('showMessagesSreeen',{text: 'entity kill : ' + this.class, color:this.color});
    });
}


Missile.prototype.routine = function() {

    this.move()
        .collisionTest();
    return true; 

}


module.exports = Missile;

