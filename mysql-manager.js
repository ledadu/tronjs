var mysql = require('mysql');

var connection = null;

var mysql_manager = {
        connect_options :   {
                host     : '127.0.0.1',
                user     : 'root',
                password : 'w29rs31',
                database : 'nibble_data'
                            },
        getConnection : function(){
            if(connection == null){
                connection = mysql.createConnection(this.connect_options);
             connection.connect();
            }
        return connection;
        }
}


module.exports = mysql_manager;
