
var extend = require('extend');
var crypto = require('crypto');

var mysql_manager = require('../mysql-manager.js');
/*
 * construct
 */
var Model_User = function(){

    var Model_base = require('./base');
    extend(true, this, new Model_base());

    this.id_user = null;
    this.hash = '';
    this.name = '';
    this.email = '';
};

/*
 * load user
 */
Model_User.prototype.load = function(id_user,callBack){
    var connection = mysql_manager.getConnection();
    var that = this;
    var query = connection.query('select * from user where id_user=' + id_user  + ';',function(err,rows,fields){
        if (err) throw err;
        if(rows.length>0){
            that.id_user = rows[0].id_user;
            that.hash = rows[0].hash;
            that.name = rows[0].name;
            that.email = rows[0].email;
        }
        callBack.apply(that);
    });
}

/*
 * user login
 */
Model_User.prototype.login = function(email,password,callBack){
    var connection = mysql_manager.getConnection();
    var that = this;
    var query = connection.query('select * from user where email=\'' + email  + '\' and password=\'' + password  + '\';',function(err,rows,fields){
        if (err) throw err;
        if(rows.length>0){
            that.id_user = rows[0].id_user;
            that.hash = rows[0].hash;
            that.name = rows[0].name;
            that.email = rows[0].email;
        }
        callBack.apply(that);
    });
}


/*
 * make hash AES id_user
 */
Model_User.prototype.makeHash = function(){
    var cipher = crypto.createCipher("aes192","nibblePass");
    var hashArray = [];
    hashArray.push(cipher.update(this.id_user.toString(),"binary","hex"));
    hashArray.push(cipher.final('hex'));
    this.hash = hashArray.join('');
}

/*
 * save
 */
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
            that.save(callBack.bind(that));
        }else{  //on update
            callBack.apply(that);
        }
    });
}

/*
 * change and save name
 */
Model_User.prototype.changeAndSaveName = function(name,callBack){
    this.name = name;
    this.save(callBack);
}



module.exports = Model_User;
