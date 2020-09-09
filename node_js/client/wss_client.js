const WebSocket = require('ws');
const port = 443;
let ws = new WebSocket('wss://localhost:443/', {
 protocolVersion: 8,
 origin: 'https://localhost:443',
 rejectUnauthorized: false //重要，自签名证书只能这样设了。CA颁发的受信任证书就不需要了
});

//開啟後執行的動作，指定一個 function 會在連結 WebSocket 後執行
ws.onopen = () => {
    console.log('open connection')
    //ws.send('something');
    setTimeout(function timeout() {
      ws.send(Date.now());
    }, 500);
}

//關閉後執行的動作，指定一個 function 會在連結中斷後執行
ws.onclose = () => {
    console.log('close connection')
}

//接收 Server 發送的訊息
ws.onmessage = event => {
    console.log(event.data)
}