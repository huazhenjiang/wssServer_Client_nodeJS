var https = require('https');
var fs = require('fs');
const port = 443;

var loops = 0;
var options = {
  key: fs.readFileSync('./server-key.pem'),
  ca: [fs.readFileSync('./cert.pem')],
  cert: fs.readFileSync('./server-cert.pem')
};

const server = https.createServer(options,function (req, res) {
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

server.listen(port, () => {
    console.log(`Server running at ${port}/`);
});