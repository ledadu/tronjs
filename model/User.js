
var extend = require('extend');

var mysql_manager = require('../mysql-manager.js');

var Model_User = function(){
    var Model_base = require('./Base.js');
    extend(true,this,new Model_base());
    
    this.id_user = null;
    this.name = '';
    this.email = '';
};


Model_User.prototype.load = function(id_user){
    var connection = mysql_manager.getConnection();

    var query = connection.query('select * from user;',function(err,rows,fields){
        if (err) throw err;
        console.log(rows); 
    });
}

module.exports = Model_User;
