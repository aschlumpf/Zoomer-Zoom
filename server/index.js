var express = require('express');
const Promise = require('bluebird');
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const chat = io.of('/chat');
const redisConnection = (require('../redis-connection'));
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const nrpSender = require('./nrp-sender-shim');
//compiled html files from react should be in public as index.html
app.use(express.static('public'));





http.listen(3000,()=>{
    // console.log(chat);
    console.log("listening on port 3000");
});
