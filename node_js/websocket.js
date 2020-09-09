const WebSocket = require('ws');
console.log(process.env.PORT)
const wss = new WebSocket.Server({ port: 3000 });


wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    var dt = new Date();
    console.log(dt)
    console.log(message);
 // console.log(message.toString());
  });
 
  ws.send('something');
});