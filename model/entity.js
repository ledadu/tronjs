var _ = require('underscore');
var extend = require('extend');

var Entity = function(params) {

    this.spawnParams = params || {};

    var Model_base = require('./base');
    extend(true, this, new Model_base());

    this.id             = this.makeid();
    this.directionlist  = ["left", "right", "up", "down"];
    this.entityType     = params.entityType   || null;
    this.isCollidable   = !_.isUndefined(params.isCollidable)   ? params.isCollidable   : true;
    this.isDestructible = !_.isUndefined(params.isDestructible) ? params.isDestructible : true;
    this.step           = 0;

    this.name = this.class + '-' + this.id;
}

Entity.prototype.spawn = function() {

    var world = this.getCollection().getParent();

    this.step      = 0;
    this.class     = this.spawnParams.class || null;
    this.content   = this.spawnParams.content || null;
    this.direction = this.spawnParams.direction || _.sample(this.directionlist);
    this.x         = this.spawnParams.x || 1/4 * world.width / world.pixelReso  +  Math.floor((world.width / world.pixelReso * 1/2) * Math.random());
    this.y         = this.spawnParams.y || 1/4 * world.height / world.pixelReso  +  Math.floor((world.height / world.pixelReso * 1/2) * Math.random());
};

Entity.prototype.move = function() {

    //Move player
    switch (this.direction) {
        case "right":
            this.x ++;
            break;
        case "left":
            this.x --;
            break;
        case "up":
            this.y --;
            break;
        case "down":
            this.y ++;
            break;
    }

    return this;
}

Entity.prototype.collisionTest = function(x,y) {

    //Function to todge 'Too much recurstion'
    var that   = this,
        world  = this.getCollection().getParent();

    if (this.direction != "dead"){

        //Manage player death colision
        if (
            x < 0 || this.x * world.pixelReso > world.width ||
            y < 0 || this.y * world.pixelReso > world.height ||
            !_.isUndefined(world.bmp[x]) && world.bmp[x][y] != null && world.bmp[x][y].color.solid
        ) {
            if (this.isDestructible) {
                this.kill();
            }
        }

        //get ohter missiles
        touchedEntities = world.missiles.getEntitiesFromXY(x,y);
        if (touchedEntities.size() > 0) {
            touchedEntities.each(function(touchedEntity){
                if (touchedEntity.id !== that.id) {
                    touchedEntity.kill();
                    that.kill();
                }
            });
        }

        //get boni
        touchedEntities = world.boni.getEntitiesFromXY(x,y);
        if (touchedEntities.size() > 0) {
            touchedEntities.each(function(touchedEntity){
               if (that.entityType === 'player') {
                    var socket = that.getSocket();
                    if (touchedEntity.class === 'playerClass') {
                        that.class = touchedEntity.content;
                        socket.emit('showMessagesSreeen',{text: 'Got player class : ' + that.class, color:that.color});
                    }
                }else{
                    world.emit('spawn',{type:'explosion', x:x, y:y, creatorId: that.id}); //move to kill !!
                }
                touchedEntity.destroy();
            });
        }

        //get players
        touchedEntities = world.players.getEntitiesFromXY(x,y);
        if (touchedEntities.size() > 0) {
            touchedEntities.each(function(touchedEntity){

                //TODO use function isCollidable & isInvinsible ..??
                if (touchedEntity.id === that.id) {
                    return;
                }

                if (touchedEntity.isDestructible) {
                    world.ioNamespace.emit('showMessagesSreeen', {text: this.id + ' ☹', color: this.color}); //move to kill
                    touchedEntity.kill();
                }


            });
    }


    }

    return this;
};

Entity.prototype.kill = function() {
    this.direction = "dead";
    this.emit('kill',this);
};
module.exports = Entity;

