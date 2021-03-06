
var extend = require('extend');


var Missiles = function(options) {

    var Collection_base = require('./entities');
    extend(true, this, new Collection_base(options));
    this._prototype(); // to keep function of this class

    this.init(options);

};


//Add prototype functions to overwrite extend class
Missiles.prototype._prototype = function() {

    //Init
    this.init = function(options){
      
        return this;
    };

}

module.exports = Missiles;
