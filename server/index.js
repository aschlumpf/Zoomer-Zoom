var express = require('express');
const Promise = require('bluebird');
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const chat = io.of('/chat');
const redisConnection = (require('./redis-connection'));
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const nrpSender = require('./nrp-sender-shim');
//compiled html files from react should be in public as index.html
app.use(express.static('public'));

app.get('/suggestions/query=:query',async (req,res)=>{
    try{
        let obj = await nrpSender.sendMessage({
            redis: redisConnection,
            eventName: 'suggestions',
            data:{
                query:req.params.query
            }
        });

        res.json(obj);
        return;
    }catch(e){
        res.status(e.status).json({error:e.message});
        return;
    }
});
app.get('/meta/id=:id',async (req,res)=>{
    try{
        let obj = await nrpSender.sendMessage({
            redis: redisConnection,
            eventName: 'meta',
            data:{
                id: parseInt(req.params.id)
            }
        });

        res.json(obj);
        return;
    }catch(e){
        res.status(e.status).json({error:e.message});
        return;
    }
});

// app.get('*',async(req,res)=>{
//     console.log(req);
//     res.json({message:"okay"});
// })
http.listen(3000,()=>{
    // console.log(chat);
    console.log("listening on port 3000");
});
