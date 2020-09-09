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
    var dt = new Date();
    console.log(`測試時間:${dt}`);
    console.log(`Server running at ${port}/`);
});

// 例項化WebSocket伺服器
const wss = new WebSocketServer({
    server: app
});
// 如果有WebSocket請求接入，wss物件可以響應connection事件來處理

var count = 0
var old_frame_num = 0
var frame_num = 0

var timeCount = 0
var timer_be_enabled=0
var tID

wss.on('connection', (wsConnect) => {
    console.log('Client connected');
    //console.log(wsConnect.upgradeReq.headers);
    wsConnect.on('message', (message) => {
    //console.log(`伺服器接收到：${message}`);
	frame_num=parser_frame_number(message);
	analysis_frame_and_record(old_frame_num,frame_num, message.length);
	//message.toString('hex')轉成16進制的raw字串
	//console.log("frame_number:%d,receiced : ",frame_num, message.length);

    //wsConnect.send(`reply: ${message}`, (err) => {
    //    if (err) {
    //        console.log(`error：${err}`);
    //    }
    //});

    });

    //當 WebSocket 的連線關閉時執行
    wsConnect.on('close', () => {
        clearInterval(tID);//close timer
        timeCount = 0

        count = 0
        console.log('Close connected')
    })
});

function parser_frame_number(raw) {
    //console.log("raw[0]:%d, raw[1]:%d, raw[2]:%d, raw[3]:%d",raw[0]&0x7f, raw[1]&0x7f, raw[2]&0x7f, raw[3]&0x7f);
    var sum =0;
    if(raw[0] == 0x08){
        if(timer_be_enabled == 0){
            console.log("Timer Enabled");
            tID = setInterval(timerFun,1000*60);//enable timer
            timer_be_enabled=1
        }

        if(raw[4] == 0x10){
            sum = (raw[1]&0x7f) +(raw[2]&0x7f)*128 +(raw[3]&0x7f)*16384;
            return 	sum;
        }
        if(raw[3] == 0x10){
            sum = (raw[1]&0x7f) + (raw[2]&0x7f)*128;
            return 	sum;
        }
        if(raw[2] == 0x10){
            return 	(raw[1]&0x7f);
        }
    }
    else{
        console.log("proto dismatch");
    }
}

function analysis_frame_and_record(old, receive_frame, rx_size) {
    //console.log("old:%d, receive_frame:%d ",old, receive_frame);
    var temp_frames = 0;
    if(old<receive_frame){
        if((old+1) != receive_frame){
            var loss=receive_frame-old-1;
            count += loss;
            console.log("[analysis]missing frame range %d - %d, loss: %d", old+1 , receive_frame-1, loss);
        }
        old_frame_num = receive_frame;
    }
    else{
        if(isNaN(receive_frame)){
            console.log("[analysis]receive_frame is NaN");
        }
        else{
            console.log("[analysis]old > receive_frame");
        }

    }

    if(rx_size > 3000){
        if(isNaN(receive_frame)){
            console.log("[analysis]receive_frame is NaN");
            temp_frames = 2;
        }
        else{
            temp_frames = 1;
        }
    }
    else{
        if(isNaN(receive_frame)){
            temp_frames = 1;
        }
    }
    count = count - temp_frames;
    if(temp_frames){
        console.log("[analysis]rx_size:%d, total loss - %d",rx_size, temp_frames);
    }
}

function timerFun(){
    timeCount++;
    console.log("============================================================");
    console.log("已經過了 %d 分鐘",timeCount);
    console.log("total:%d, miss:%d",frame_num,count );
    console.log("============================================================");
}