
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
    this.emit('add',model);
};

Collection_base.prototype.remove = function(model) {
   delete this.list[model.id]; 
};

Collection_base.prototype.get = function(id) {
   return this.list[id]; 
};

Collection_base.prototype.at = function(index) {
    return this.list[_.keys(this.list)[index]];
}

//like to undercore filter
Collection_base.prototype.filter = function(callBack){
    var _list = {};
        _collection = new Collection_base();
    _collection.getParent = this.getParent;

    _.each(this.list, function(model){
        if (callBack(model)) { _list[model.id] = model;};
    });
    _collection.list = _list;
    return _collection;
};

//proxy to undercore size
Collection_base.prototype.size = function(){
    return _.size(this.list);
};

//proxy to undercore each
Collection_base.prototype.each = function(callBack){
    _.each(this.list, callBack);
    return this;
};



//filter remove by callBack
Collection_base.prototype.filterRemove = function(callBack){
     var _list = {};
    _.each(this.list, function(model){
        if (!callBack(model)) { _list[model.id] = model;};
    });
    this.list = _list;
    return this;
};
module.exports = Collection_base;
