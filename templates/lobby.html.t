<html>
    <head>
        <script src="/socket.io/socket.io.js"></script>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
        <script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js"></script>
        <link rel="stylesheet" type="text/css" href="/styles.css">
        <script>
          
        </script>

        <script src="/lobby.js"></script>  
    </head>
    <body>
        <form class="sendValue">
            name <input name="nickname"/> <button >Change name</button>
        </form>
	  <ul>
	    {{#worlds}}
             <li>
		<a href=/world/{{id}}>room{{id}}</a>
		<div class="gameMode">{{gameMode}}</div>
		<div class="nbPlayers">{{nbPlayers}}</div>
	    </li>
	    {{/worlds}}
	  </ul>

    </body>
</html>
