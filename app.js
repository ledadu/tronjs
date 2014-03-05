var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');
var _= require('underscore');
var Player = require('./Player');
app.listen(8182);
var numplayercount =0;
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
	console.log(req.url);
    res.writeHead(200);
    res.end(data);
  });
}





var world = require('./World');
var players = {};



io.configure('production', function(){
  io.set('log level', 1);
});

io.sockets.on('connection', function (socket) {
	socket.heartbeatTimeout = 5000;
	var player = new Player();
	
  socket.emit('caneva',  world );
  player.spawn();
  /*player.name = player.id = 'A -- ' + numplayercount;
  numplayercount++;*/
  players[player.id]=player;
  console.log('Got connect!',player.id ,player.name);
  
  //  socket.on  socket.on socket.on socket.on socket.on socket.on socket.on
  
  socket.on('keyup', function (data) {
	takePlayerFunction(data);	
  });
  
   socket.on('touchup', function (data) {
		takePlayerFunction(data);	
  });
  
  socket.on('disconnect', function() {
      console.log('Got disconnect!',player.id ,player.name);
	  newplayers = {};  
	  _.each(players,function(p){
		if (p.id != player.id) {
				newplayers[p.id]=p;
			}
	  });
	  players = newplayers;
	  io.sockets.emit('playerQuit',  player );  
	  player=false;
   });
    
	socket.on('sendValue', function(data) {
		 console.log('sendValue!',data);
		 _.each(data,function(data){
			if(data.name=='nickname'){	
				oldplayerName = player.name;
				io.sockets.emit('playerQuit',  player );      
				
				player.name=data.value;
				if(players[player.id]!=undefined){
					players[player.id]=player;
				}
				io.sockets.emit('playerUpdate',  player );				
				
			}
		 });
		 
	  });
	  
	  socket.on('printDebug', function(data) {
		console.log(data);
	  });
	  
	  function removeplayer(pp){
		  newplayers = {};  
		  _.each(players,function(p){
			if (p.id != pp.id) {
					newplayers[p.id]=pp;
				}
		  });
		  players = newplayers;
	  }
   
  function takePlayerFunction(data){
	if(data.keyFunction!=''){		
		if (player.direction!="dead"){
			if (_.contains(player.directionlist, data.keyFunction)){
				if (
						(
							(data.keyFunction=="left" || data.keyFunction=="right") &&
							(player.direction=="up" || player.direction=="down") 
						)
						||
						(
							(data.keyFunction=="up" || data.keyFunction=="down") &&
							(player.direction=="left" || player.direction=="right")
						)							
					){
						player.direction=data.keyFunction;
					sendMessage(data.keyFunction);
					}
				return;
			}
			
		}
		if (data.keyFunction=="clear"){
			console.log("clear Bmp");
			world.bmp = [];
			io.sockets.emit('caneva',  world );
		}
	}
  }
  function sendMessage(message){
	socket.emit('message',message);
}





  
});


function clearWorld(){
	world.bmp = [];
	io.sockets.emit('caneva',  world );
	_.each(players,function (p){
		p.spawn();
	});
}

serverRoutine();

function serverRoutine(){
	var lastplayer=null;
	countplayernotdead=0;
	_.each(players,function (p){	//todo _.find
		if(p.direction!="dead"){
				lastplayer=p;
				countplayernotdead++;	
		}
	});
	if(countplayernotdead <= 1){
		clearWorld();
		if(_.size(players)>1 && lastplayer!=null){
			lastplayer.score++;
		}else{
			
		}
	}
	//console.log(_.size(players));
	_.each(players,function (p){
		playerRoutine(p);	
	});
	
	
	
	setTimeout (serverRoutine,50);
};

function playerRoutine(player){
	if(player==false) return;
	switch(player.direction){		
		case "right": player.x+=player.speed;break;
		case "left": player.x-=player.speed;break;
		case "up": player.y-=player.speed;break;
		case "down": player.y+=player.speed;break;
	}
	
	if(world.bmp[player.x/world.pixelReso]==undefined){
		world.bmp[player.x/world.pixelReso] = [];
	}
	if (player.direction!="dead")
	if (
			player.x < 0 || player.x > world.width ||
			player.y < 0 || player.y > world.height ||
			world.bmp[player.x/world.pixelReso][player.y/world.pixelReso]!=null			
		){
		player.kill();
		io.sockets.emit('showMessagesSreeen',{text:player.id + ' ☹' , color:player.color});
	}
	
	world.bmp[player.x/world.pixelReso][player.y/world.pixelReso]=player.color;
	
	if(_.contains(player.directionlist,player.direction)){	
		players[player.id]=player;
		io.sockets.emit('playerUpdate',  player );
	}
	
}

/*

idee match scoring avec bot // necessice un lobby
			t = temps propre de survi;
			n = nombre de joueurs;
			T = temps de mort du BOT sinon 0
			B = 10 ;bonnus de temps de survi pour vaincu le BOT
			
			score = t + T * B/n
			
*/

