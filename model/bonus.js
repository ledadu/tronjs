var _      = require('underscore'),
    extend = require('extend');

var Bonus = function(params) {

    params = params || {};
    params.entityType   = 'bonus';
    params.isCollidable = false;

    var Model_base = require('./entity'),
        colors = {
            score         : hexToColor('0048BA'),
            shooter       : hexToColor('FF3855'),
            digger        : hexToColor('A83731'),
            speeder       : hexToColor('87FF2A'),
            invincibility : hexToColor('FFF700')
        };
    extend(true, this, new Model_base(params));

    /**
    * Overwirite Entity.spawn
    */
    this.spawn = function() {

        var world = this.getCollection().getParent();

        this.step      = 0;
        this.class     = this.spawnParams.class || null;
        this.content   = this.spawnParams.content || null;
        this.direction = this.spawnParams.direction || _.sample(this.directionlist);
        this.x         = this.spawnParams.x || Math.floor((world.width / world.pixelReso) * Math.random());
        this.y         = this.spawnParams.y || Math.floor((world.height / world.pixelReso) * Math.random());

        if (this.class == 'score') {
            this.color     = colors.score;
        }

        if (this.class == 'playerClass') {
            this.color     = colors[this.content];
        }

        if (!_.isUndefined(world.bmp[this.x]) && !_.isUndefined(world.bmp[this.x][this.y])) {
            world.bmp[this.x][this.y] = null;
        }

    };

}



Bonus.prototype.routine = function() {
    return false;
}

module.exports = Bonus;

function hexToColor(hex) {
    if (_.isUndefined(hex)) {
        return {
            r: 128,
            g: 128,
            b: 128,
            a: 1,
        };
    }
    var hexCutted = hex.match(/.{1,2}/g);
    return {
        r: parseInt(hexCutted[0],16),
        g: parseInt(hexCutted[1],16),
        b: parseInt(hexCutted[2],16),
    };
}

