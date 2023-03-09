let express = require('express');
let app = express();
//const http = require('http');

const fs = require('fs');
//let server = http.createServer(app);
let server = require('https').Server({
	key: fs.readFileSync('./privatekey.pem'),
    cert: fs.readFileSync('./certificate.pem')
}, app);
let io = require('socket.io')(server);
let stream = require('./ws/stream');
let path = require('path');



app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res)=>{
    res.sendFile(__dirname+'/index.html');
});


io.of('/stream').on('connection', stream);

server.listen(3000,'0.0.0.0');