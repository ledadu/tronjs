
var extend = require('extend');

var Model_User = function(){
    var Model_base = require('./Base.js');
    extend(true,this,new Model_base());
    
    this.id_user = null;
    this.name = '';
    this.email = '';
};


Model_User.prototype.load = function(id_user){

    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host     : '127.0.0.1',
        user     : 'root',
        password : 'w29rs31',
        database : 'nibble_data'
    });

    connection.connect();

    var query = connection.query('select * from user;',function(err,rows,fields){
        if (err) throw err;
        console.log(rows);
    }); 
}

module.exports = Model_User;
