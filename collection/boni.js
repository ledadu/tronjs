
var extend = require('extend');

var Bonus = require('../model/bonus');

var Boni = function(options) {

    var Collection_base = require('./entities');
    extend(true, this, new Collection_base(options));
    this._prototype(); // to keep function of this class

    this.init(options);

//TODO add event collection to catch onadd emitsocket send bonus



};


//Add prototype functions to overwrite extend class
Boni.prototype._prototype = function() {

    //Init
    this.init = function(options){
        //spawn boni
        
        this.add(new Bonus({class:'playerClass',content:'speeder'}));

        this.add(new Bonus({class:'playerClass',content:'digger'}));

        return this;
    };

}

Boni.prototype.addRandom = function(options){

    var playerClass = ['speeder', 'digger', 'shooter'];

    bonus = new Bonus({class:'playerClass',content:playerClass[Math.floor(Math.random()*playerClass.length)]});
    this.add(bonus);

    return this;
};


module.exports = Boni;
