
var extend = require('extend');
var crypto = require('crypto');

var mysql_manager = require('../mysql-manager.js');

var Model_User = function(){
    var Model_base = require('./Base.js');
    extend(true,this,new Model_base());
    
    this.id_user = null;
    this.hash = '';
    this.name = '';
    this.email = '';
};

Model_User.prototype.load = function(id_user,callBack){
    var connection = mysql_manager.getConnection();

    var query = connection.query('select * from user where id_user=' + id_user  + ';',function(err,rows,fields){
        if (err) throw err;
        console.log(rows); 
    });
    callBack(this);
}

Model_User.prototype.makeHash = function(){
    var cipher = crypto.createCipher("aes192","nibblePass");
    var hashArray = [];
    hashArray.push(cipher.update(this.id_user.toString(),"binary","hex"));
    hashArray.push(cipher.final('hex'));
    this.hash = hashArray.join('');
}


Model_User.prototype.save = function(callBack){
    var that = this;
    var connection = mysql_manager.getConnection();
    if(this.id_user != null){
        //update
        var sql = "update user set hash='" + this.hash + "', name='" + this.name + "', email='" + this.email + "' where id_user=" + this.id_user + ";";
    }else{
        //insert
                var sql = "insert into user(name,email) VALUES ('" + this.name + "','" + this.email  + "');";
    }     

    var query = connection.query(sql,function(err,status,fields){
        if (err) throw err;
        if(status.changedRows == 0){  //on insert
            that.id_user = status.insertId;
            that.makeHash();
            that.save(function(){callBack(that)});
        }else{  //on update
            callBack(that);
        }
    });
}





module.exports = Model_User;
