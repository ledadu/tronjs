

var Model_base = function(){
    this.basedata = 'basetoot';
//construct
}

Model_base.prototype.getCollection = function(){
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
