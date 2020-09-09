//引用'http'模組
const http = require('http');

//設定server網址，因為在本機端測試，所以輸入127.0.0.1
const hostname = '127.0.0.1';
//設定port號，這邊多少都可以，不要和現有的port重複就好
const port = 3000;

//新增一個server並指定他的頁面資訊，內容為'Hello World!'
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World!\n');
});

//監聽剛剛新建的server，開啟後就執行裡面的console.log
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});