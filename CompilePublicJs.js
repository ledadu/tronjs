var _ = require('underscore');
var fs = require('fs');
var UglifyJS = require("uglify-js");

var CompilePublicJs = function() {
    //construct
    this.jsFoldersSources=[];
};

CompilePublicJs.prototype.addFolderSource = function(folderPathSource) {
	this.jsFoldersSources.push(folderPathSource);
};

CompilePublicJs.prototype.compileUglifyJs = function(folderPath) {
	var that=this;
	_.each(this.jsFoldersSources,function(foldersSource){
		var baseFileName = _.last(foldersSource.split('/'));
		var buffer = '';
		var files = require(foldersSource  +'/_filelist.js');
		console.log(files);
		_.each(files,function(file){
			 buffer += fs.readFileSync(foldersSource + '/' + file) ;
		});
		var stream = UglifyJS.OutputStream();
		var uglifyJs = UglifyJS.parse(buffer);
		uglifyJs.print(stream);
		uglifyCode = stream.toString();
		fs.writeFileSync(folderPath + baseFileName + '.js',uglifyCode);
		console.log(foldersSource + " => "+ folderPath + baseFileName + '.js'  +  " compiled");
	});

}

module.exports = CompilePublicJs;
