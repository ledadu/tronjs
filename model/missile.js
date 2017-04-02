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
        .collisionTest();

//TODO refacto collisions !!


    //get ohter missiles
    touchedEntities = world.missiles.getEntitiesFromXY(this.x,this.y);
    if (touchedEntities.size() > 0) {
        touchedEntities.each(function(touchedEntity){
            if (touchedEntity.id !== that.id) {
                touchedEntity.kill(); 
                that.kill();
            }
        });
    }

    //get boni
    touchedEntities = world.boni.getEntitiesFromXY(this.x,this.y);
    if (touchedEntities.size() > 0) {
        touchedEntities.each(function(touchedEntity){
            world.emit('spawn',{type:'explosion', x:that.x, y:that.y, creatorId: that.id});
            touchedEntity.destroy(); 
        });
    }

    //get players
    touchedEntities = world.players.getEntitiesFromXY(this.x,this.y);
    if (touchedEntities.size() > 0) {
        touchedEntities.each(function(touchedEntity){
            //TODO use function isCollidable & isInvinsible ..??
            if (touchedEntity.class == 'digger'){
                if (!touchedEntity.activatePower && !touchedEntity.activatePower2) {
                    touchedEntity.kill(); 
                }
            }
        });
    }

    return true; 

}


module.exports = Missile;

