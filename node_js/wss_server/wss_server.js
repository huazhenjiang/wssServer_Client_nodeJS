// wss.js

const fs = require('fs');
const port = 443;
// 一些配置資訊
var options = {
  key: fs.readFileSync('./server-key.pem'),
  ca: [fs.readFileSync('./cert.pem')],
  cert: fs.readFileSync('./server-cert.pem')
};

const httpServ = require('https');
const WebSocketServer = require('ws').Server; // 引用Server類

// 建立request請求監聽器
const processRequest = (req, res) => {
    res.writeHead(200);
    res.end('WebSockets server on!\n');
};

const app = httpServ.createServer(options,function (req, res) {
  fs.readFile(__dirname + req.url, function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    console.log("(loops: %d).access %s",loops++ ,__dirname + req.url);
    res.writeHead(200);
    res.end(data);
  });
});

app.listen(port, () => {
    console.log(`Server running at ${port}/`);
});

// 例項化WebSocket伺服器
const wss = new WebSocketServer({
    server: app
});
// 如果有WebSocket請求接入，wss物件可以響應connection事件來處理
var count = 0
var frame_num = 0
wss.on('connection', (wsConnect) => {
    console.log('Client connected');
	
    wsConnect.on('message', (message) => {
        //console.log(`伺服器接收到：${message}`);
	frame_num=parser_frame_number(message);//message[1];
	//message.toString('hex')轉成16進制的raw字串
	console.log("%d.%d receiced : " ,count++ ,frame_num.toString(), message.toString('hex'));
		//console.log("%d. receiced : " ,count++ , message.length);
        //wsConnect.send(`reply: ${message}`, (err) => {
        //    if (err) {
        //        console.log(`error：${err}`);
        //    }
        //});
		
    });
	
    //當 WebSocket 的連線關閉時執行
    wsConnect.on('close', () => {
        console.log('Close connected')
		count = 0
    })	
});

function parser_frame_number(raw) {
  // 函數內容 ...
	if(raw[2] == 0x10){
		return 	raw[1];
	}
	if(raw[3] == 0x10){
		return 	(raw[1]&0x7f) +(raw[2]&0x7f)*128;
	}
}