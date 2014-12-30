var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

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
    socket.on('chat message', function(msg){
      io.emit('chat message', msg+ ' (served by:'+cluster.worker.id+')');
    });
  });

  http.listen(49160, function(){
    console.log('listening on *:49160');
  });
}

