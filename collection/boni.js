
var extend = require('extend');

var Bonus = require('../model/bonus');

var Boni = function(options) {

    var Collection_base = require('./base');
    extend(true, this, new Collection_base(options));

    this.init(options);

};


//Init
Boni.prototype.init = function(options){
    //spawn boni
    var bonus = null;
    
    bonus = new Bonus({class:'playerClass',value:'speeder'});
    this.add(bonus);
    bonus.spawn();

    bonus = new Bonus({class:'playerClass',value:'digger'});
    this.add(bonus);
    bonus.spawn();

};


Boni.prototype.getBonusFromXY = function(x,y){
    boni = this.filter(function(bonus){
        return bonus.x === x && bonus.y === y;
    });

    if (boni.length === 0) {
        return null;
    }

    return boni[0];
}



module.exports = Boni;
