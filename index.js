var app = require('express')();
var https = require('https').Server(app);
var io = require('socket.io')(https);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

https.listen(8080, function(){
  console.log('listening on *:8080');
});
