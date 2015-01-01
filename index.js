var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

var userId = 1;

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {
  // Workers can share any TCP connection
  // In this case its a HTTP server

  var app = require('express')();
  app.set('port', process.env.PORT || 443);

  var http = require('http').Server(app);
  // for https proceed with:
  // https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs
  // openssl.org
  // startssl.com
  // https://shaaaaaaaaaaaaa.com/

  var io = require('socket.io')(http);

  app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
  });

  io.on('connection', function(socket){
    var nick = 'Guest'+userId++;
    socket.set('nickname', nick);
    socket.broadcast.emit('chat message', 'Another user has connected.');
    socket.on('chat message', function(msg){
      io.emit('chat message', nick+': '+msg+ ' (served by:'+cluster.worker.id+')');
    });
  });

  http.listen(app.get('port'), function(){
    console.log('listening on *:443');
  });
}


