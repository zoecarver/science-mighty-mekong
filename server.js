var app = require('express')();
var express = require('express')
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
}

const submitions = (submition, user, cb) => {
  if (!findObjectByKey(users, 'name', user)) {
    users.push({
      name: user,
      points: 0
    })
  }
  if (submition === 1000) {
    findObjectByKey(users, 'name', user).points += 10;
  }
  cb();
  //console.log('users', users);
}

let users = [];

app.use('/static', express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/start', function(req, res){
  res.sendFile(__dirname + '/start.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    msg = JSON.parse(msg);
    //console.log(msg.user, msg.val);
    submitions(msg.val, msg.user, () => io.emit('score', users))
  });
});

http.listen(3000, function(){
  //console.log('listening on *:3000');
});