
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Model_base = function(){

    EventEmitter.call(this);
}

util.inherits(Model_base, EventEmitter);

Model_base.prototype.getCollection = function(){
    return null;
}

Model_base.prototype.destroy = function(){
    var collection = this.getCollection();

    if (!_.isNull()) {
        collection.remove(this);
    }

    return null;
}

Model_base.prototype.makeid = function()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = Model_base;
