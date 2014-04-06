var extend = require('extend');

var Model_test = function(){
    var Model_base = require('./base.js');
    extend(true,this,new Model_base());
    
    this.testdata = 'oooottest';
};


Model_test.prototype.testfunc = function(){
    return 'boom';
    
}

module.exports = Model_test;
