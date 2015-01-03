var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var mongo = require('mongodb').MongoClient;
var url = 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + ':27017/test';

var insertMsg = function(db, msg, callback) {
  var collection = db.collection('messages');
  collection.insert(msg, function(err, result) {
    callback(result);
  });
}

var getMsgs = function(db) {
  var col = db.collection('messages');
  col.find().limit(10).toArray(function(err, docs) {
     return docs;
  })
}

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

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

  http.listen(app.get('port'), function(){
    console.log('Clusterable nodejs socketio chat app');
    console.log('numCPUs: '+numCPUs)
    console.log('listening on *:443');
  });

  io.on('connection', function (socket) {
    var addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
      // we tell the client to execute 'new message'
      console.log(socket.username+':'+data);
      var msg = {
        username: socket.username,
        message: data
      };
      mongo.connect(url, function(err, db) {
        if(err!=null) console.log(err);
        //console.log(db);
        insertMsg(db, msg, function() {
          socket.broadcast.emit('new message', msg);
        });
      });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
      // we store the username in the socket session for this client
      socket.username = username;
      // add the client's username to the global list
      usernames[username] = username;
      ++numUsers;
      addedUser = true;
      mongo.connect(url, function(err, db) {
        socket.emit('login', {
          numUsers: numUsers,
          msgs: getMsgs(db)
        });
      });
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers
      });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
      socket.broadcast.emit('typing', {
        username: socket.username
      });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
      socket.broadcast.emit('stop typing', {
        username: socket.username
      });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
      // remove the username from global usernames list
      if (addedUser) {
        delete usernames[socket.username];
        --numUsers;

        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: numUsers
        });
      }
    });

  });

}


