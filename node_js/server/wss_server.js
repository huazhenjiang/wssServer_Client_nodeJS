// wss.js

const fs = require('fs');

// 一些配置資訊
const cfg = {
    port: 8888,
    ssl_key: 'ssl.key',
    ssl_cert: 'ssl.crt'
};

const httpServ = require('https');
const WebSocketServer = require('ws').Server; // 引用Server類

// 建立request請求監聽器
const processRequest = (req, res) => {
    res.writeHead(200);
    res.end('WebSockets server on!\n');
};

const app = httpServ.createServer({
    // 向server傳遞key和cert引數
    key: fs.readFileSync(cfg.ssl_key),
    cert: fs.readFileSync(cfg.ssl_cert)
}, processRequest).listen(cfg.port);

// 例項化WebSocket伺服器
const wss = new WebSocketServer({
    server: app
});
// 如果有WebSocket請求接入，wss物件可以響應connection事件來處理
var count = 0

wss.on('connection', (wsConnect) => {
    console.log('Client connected');
	
    wsConnect.on('message', (message) => {
        //console.log(`伺服器接收到：${message}`);
		console.log("%d. receiced : " ,count++ , message.length);
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