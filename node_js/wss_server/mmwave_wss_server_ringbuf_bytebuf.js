// wss.js

const fs = require('fs');
const util = require('util');
var log = require('fs');
const port = 443;
var dt=0;
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
    dt = new Date();
    console.log(`測試時間:${dt}`);
    console.log(`Server running at ${port}/`);
    //save_log("\r\nTime:",${dt});
    save_log(util.format("\r\nTesting Time:%s, Server running at %d", dt, port));
    //save_log(util.format("\r\nServer running at %d",port));
    //test_match();
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

var total_transfer_size =0
var findframe = 0
wss.on('connection', (wsConnect) => {
    console.log('Client connected');
    save_log("\r\nClient connected");
    //console.log(wsConnect.upgradeReq.headers);
    wsConnect.on('message', (message) => {
    //console.log(`伺服器接收到：${message}`);
    frame_num=parser_frame_number(message);
    findframe=tofind_frame_sync_pattern(message, message.length);
	analysis_frame_and_record(old_frame_num,frame_num, message.length, findframe);
	//message.toString('hex')轉成16進制的raw字串
	console.log("frame_number:%d,receiced : ",frame_num, message.length);
    total_transfer_size += message.length;
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
        save_log("\r\nClose connected");
    })
});


function test_match(){
    var test_count = 0;
    let text = "ABCDERGABCFFASD";
    let pattern = "\x41\x42";
    let offset = 0;
    let index;
    let indexArray = [];
    while ((index = text.indexOf(pattern, offset)) >= 0) {
        indexArray.push(index);
        offset = index + 1;
        test_count++;
    }
    console.log(indexArray);
    console.log("find:%d", test_count);
/*
    var test_count = 0;
    var str = "ABCDERGABCFFASD";
    var reg = /\x41\x42/;
    if(reg.exec(str)){
        // 包含
        test_count++;

    }
    console.log("find:%d", test_count);
*/
}

function tofind_frame_sync_pattern(input, frame_size){
    //var n;
    //var arr3 = [ 'cat', 'rat', 'bat' ];
    //var syncPattern = [0x02, 0x01, 0x04, 0x03, 0x06, 0x05, 0x08, 0x07];

    var finditems = 0;
/*
    var str = input;
    var reg = /\x02\x01\x04\x03\x06\x05\x08\x07/;
    if(reg.exec(str)){
        // 包含
        //console.log("find");
        finditems++;
    }
    if(finditems > 1){
        console.log("frame size:%d, find frames:%d ",frame_size, finditems);
        save_log(util.format("\r\nframe size:%d, find frames:%d ",frame_size, finditems));
    }
    //console.log("finditems:%d ",finditems);
*/
    let text = input;
    let pattern = "\x02\x01\x04\x03\x06\x05\x08\x07";
    let offset = 0;
    let index;
    //let indexArray = [];
    while ((index = text.indexOf(pattern, offset)) >= 0) {
        //indexArray.push(index);
        offset = index + 1;
        finditems++;
    }
    //console.log(indexArray);
    //console.log("find:%d", finditems);
    return finditems;
}

function parser_frame_number(raw) {
    //console.log("raw[0]:%d, raw[1]:%d, raw[2]:%d, raw[3]:%d",raw[0]&0x7f, raw[1]&0x7f, raw[2]&0x7f, raw[3]&0x7f);
    var sum =0;
    if(raw[0] == 0x08){
        if(timer_be_enabled == 0){
            console.log("Frames received, start timer");
            save_log("\r\nFrames received, start timer");
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
    //else{
    //    console.log("proto dismatch");
    //}
}

function analysis_frame_and_record(old, receive_frame, rx_size, findframe) {
    //console.log("old:%d, receive_frame:%d ",old, receive_frame);
    var temp_frames = 0;
    dt = new Date();
    if(old<receive_frame){
        if((old+1) != receive_frame){
            var loss=receive_frame-old-1;
            count += loss;
            if(findframe > 1){
                count = count - (findframe -1);
                save_log(util.format("\r\n[analysis]over 1 frames in packets(found:%d)", findframe));
            }
            console.log("[analysis]it might be missing frame at %d - %d, loss: %d", old+1 , receive_frame-1, loss);
            save_log(util.format("\r\n[analysis]it might be missing frame at %d - %d, loss: %d, time:%s", old+1 , receive_frame-1, loss, dt));
        }
        old_frame_num = receive_frame;
    }
    else{
        if(isNaN(receive_frame)){
            count = count - findframe;
            console.log("[analysis]receive_frame is NaN");
            //if(rx_size > 2048)
                //save_log(util.format("\r\n[analysis]time:%s, found frames in NaN packets(found:%d), size:",dt, findframe, rx_size));
            //save_log(util.format("\r\n[analysis]receive_frame is NaN, size:%d, time:%s", rx_size, dt));
        }
        //else{
        //    console.log("[analysis]old > receive_frame");
        //}

    }

}

function save_log(text){
    log.appendFile('./log.txt', text , function (err) {
        if (err)
            console.log(err);
        else
            console.log('Write operation complete.');
    });

}

function timerFun(){
    timeCount++;

    console.log("============================================================");
    console.log("已經過了 %d 分鐘",timeCount);
    console.log("total:%d, miss:%d, total_transfered_size:",frame_num,count, total_transfer_size);
    console.log("============================================================");
    //save_log("\r\n===================================================");
    save_log(util.format("\r\n%d minutes passing",timeCount));
    save_log(util.format("\r\nTotal transfered frames:%d, miss amount:%d, Total Transferred size:",frame_num,count,total_transfer_size));
    //save_log("\r\n===================================================");
}