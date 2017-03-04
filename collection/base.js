
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Collection_base = function(options){
    
    options = options || {};

    this.list = {};   //list of model

    this.getParent = function (){return options.parent;};

    EventEmitter.call(this);
}

util.inherits(Collection_base, EventEmitter);

Collection_base.prototype.add = function(model) {
    var that = this;
    model.getCollection = function(){return that;};
    this.list[model.id] = model;
};

Collection_base.prototype.remove = function(model) {
   delete this.list[model.id]; 
};

Collection_base.prototype.get = function(id) {
   return this.list[id]; 
};

//proxy to undercore filter
Collection_base.prototype.filter = function(callBack){
    return _.filter(this.list, callBack);
};

//proxy to undercore each
Collection_base.prototype.each = function(callBack){
    _.each(this.list, callBack);
    return this;
};


module.exports = Collection_base;
