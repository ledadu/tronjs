
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

Entities.prototype.getEntitiesFromXY = function(x,y){
    return this.filter(function(entity){
        return entity.x === x && entity.y === y;
    });
}



module.exports = Entities;
