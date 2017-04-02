var _ = require('underscore');
var extend = require('extend');

var Laser = function(params) {

    params = params || {};
    params.entityType = 'laser';

    var Model_base = require('./entity');
    extend(true, this, new Model_base(params));

    this.color = {
        r: 255,
        g: 255,
        b: 255,
        a: 0.3
    }

    this.playerId = params.playerId;

    this.on('kill',function(){
        var world = this.getCollection().getParent();
        world.ioNamespace.emit('showMessagesSreeen',{text: 'entity kill : ' + this.class, color:this.color});
    });


}


Laser.prototype.routine = function() {
    
    this.step++;

    var that            = this,
        world           = this.getCollection().getParent(),
        radius          = Math.round((this.step/world.pixelReso)),
        y               = this.y,
        x               = this.x,
        isHorizontal    = this.direction === 'left' || this.direction === 'right';
        touchedEntities = {},
        bmpToDelete     = [];

        if (this.step === 2*world.pixelReso) {

            for(var thickness =-1 ; thickness <= 1; thickness++) {

                if (isHorizontal) {
                    x = this.x;
                    y = this.y + thickness;
                }else{
                    x = this.x + thickness;
                    y = this.y;
                }
                
                while
                    ( x < world.width &&
                        x > 0 &&
                        y < world.height &&
                        y > 0
                    ) {
                    switch (this.direction) {
                        case "right":
                            x++;
                            break;
                        case "left":
                            x--;
                            break;
                        case "up":
                            y--;
                            break;
                        case "down":
                            y++;
                            break;
                    }

                    //Clean world
                    if (!_.isUndefined(world.bmp[x]) && !_.isUndefined(world.bmp[x])[y]) {
                        delete world.bmp[x][y];
                        //put null to delete
                        bmpToDelete.push({x:x,y:y,content:null});
                    }
    
                    this.collisionTest(x,y);

                } 
            }

            world.ioNamespace.emit('updateBmpPixels', bmpToDelete);
        }

        if (radius >=3) {
            this.destroy();
        }

        return true; 

}
module.exports = Laser;

