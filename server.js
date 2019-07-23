// Dependencies
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Server port
const port = 3000;

// Routing
app.use('/', express.static(__dirname + '/client'));

// Start the server
http.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

// All connected users
const connected_users = [];

// Socket Connections
io.on('connection', socket => {

  // Ask the user for info about themselves
  socket.send([0]);

  // Get a packet from the user
  socket.on('message', data => {
    const type = data[0]; // Get the type of packet

    switch (type) {
      case 0:
        // Credentials packet
        user = {
          'socket': socket,
          'name': data[1]
        };
        connected_users.push(user);
        console.log('Welcome ' + data[1] + ' to the chat!');

        for (let i = 0; i < connected_users.length; i++) {
          socket.send([2, {
            'name': connected_users[i].name
          }]);

          if (i < connected_users.length - 1) {
            connected_users[i].socket.send([2, {
              'name': data[1]
            }]);
          }
        }

        break;
      case 1:
        // Message packet
        handleMessage(socket, data[1]);
        break;
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    for (let i = 0; i < connected_users.length; i++) {
      connected_users[i].socket.send([3, i]);

      if (connected_users[i].socket === socket) {
        console.log(connected_users[i].name + ' has left the chat.');
        const user = connected_users.splice(i, 1);
      }
    }
  });
});

// String sanitizer
function sanitizeString(str){
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,'');
    return str.trim();
}

// Chat logic
function handleMessage (socket, message) {
  if (message.trim() == '') {
    return; // No message
  }

  const text = sanitizeString(message);

  const packet = [1];

  for (let i = 0; i < connected_users.length; i++) {
    if (connected_users[i].socket === socket) {
      packet.push({
        'user_id': i,
        'message': text
      });
    }
  }

  for (let i = 0; i < connected_users.length; i++) {
    connected_users[i].socket.send(packet);
  }
}
