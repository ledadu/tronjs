
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
    for (var i=1; i<=5; i++){
        bonus = new Bonus();
        this.add(bonus);
        bonus.spawn();
    };
};



module.exports = Boni;
