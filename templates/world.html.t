<html>
    <head>
        <script src="/socket.io/socket.io.js"></script>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
        <script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js"></script>
        <link rel="stylesheet" type="text/css" href="/styles.css">
        <script>
            var worldId = {{worldId}};
        </script>

        <script src="/world.js"></script>  
    </head>
    <body>
        <div id="text"></div>
        <div id="id_user">id_user : {{id_user}}</div>
        <div id="cnv" style="border:solid 1px #eeeeee;position: relative;"></div>
        <form class="sendValue">
            name <input name="nickname"/> <button >Change name</button>
        </form>
    </body>
</html>
