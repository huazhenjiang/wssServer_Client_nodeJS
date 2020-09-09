const WebSocket = require('ws');
 
const ws = new WebSocket('ws://cb31d96b.ngrok.io');
//const ws = new WebSocket('ws://192.168.200.11:3000'); 
ws.on('open', function open() {
  const array = new Float32Array(5);
 
  for (var i = 0; i < array.length; ++i) {
    array[i] = i / 2;
  }
 
  //ws.send(array);
  ws.send('hello,world');
});

//關閉後執行的動作，指定一個 function 會在連結中斷後執行
ws.onclose = () => {
    console.log('close connection')
}

//接收 Server 發送的訊息
ws.onmessage = event => {
    console.log(event.data)
}