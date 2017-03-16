
var extend = require('extend');

var Entities = function(options) {

    var Collection_base = require('./base');
    extend(true, this, new Collection_base(options));

    this.on('add', function(entity){entity.spawn();});

};

Entities.prototype.spawnAll = function () {
    this.each(function(entity) {
        entity.spawn();
    });
};

Entities.prototype.getEntityFromXY = function(x,y){
    entities = this.filter(function(entity){  //TODO USE WHERE!!!
        return entity.x === x && entity.y === y;
    });

    if (entities.length === 0) {
        return null;
    }

    return entities[0];
}



module.exports = Entities;
