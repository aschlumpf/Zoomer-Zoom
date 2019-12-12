var express = require('express');
const Promise = require('bluebird');
var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const liveStock = io.of('/LiveStockData');
const redisConnection = (require('./redis-connection'));
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const nrpSender = require('./nrp-sender-shim');
const cors = require('cors');
let sanitize = require('mongo-sanitize');
//compiled html files from react should be in public as index.html

let timers = {};
// app.use(express.static('./server/public'));
app.use(cors());
io.origins('*:*');

app.get('/suggestions/query=:query',async (req,res)=>{
    try{
        let obj = await nrpSender.sendMessage({
            redis: redisConnection,
            eventName: 'suggestions',
            data:{
                query: sanitize(req.params.query)
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
                id: parseInt(sanitize(req.params.id))
            }
        });

        res.json(obj);
        return;
    }catch(e){
        res.status(e.status).json({error:e.message});
        return;
    }
});


liveStock.on("connection",(socket)=>{
    let rooms = {};
    socket.on("join", (obj)=>{
        if(parseInt(sanitize(obj.id))>504||parseInt(sanitize(obj.id))<0){
            return;
        }
        socket.join(sanitize(obj.id));
        if(timers[obj.id]==null){
            timers[obj.id]={
                obj: setInterval(async ()=>{
                    console.log("interval");
                    try{
                        let result = await nrpSender.sendMessage({
                            redis: redisConnection,
                            eventName: 'StockData',
                            data:{
                                id: parseInt(sanitize(obj.id))
                            }
                        });
                        
                        io.of('/LiveStockData').to(obj.id).emit('data',result);
                        console.log(result);
                    }catch(e){
                        
                        console.log(e);
                    }
                },3000),
                num : 1
            };
        }else{
            timers[obj.id].num = timers[obj.id].num+1;
        }
        rooms[obj.id] = true;
    });
    socket.on("disconnect",()=>{
        Object.keys(rooms).forEach(room=>{
            timers[room].num = timers[room].num-1;
            if(timers[room].num==0){
                clearInterval(timers[room].obj);
                delete timers[room];
            }
        });
    });

})

http.listen(3000,()=>{
    // console.log(chat);
    console.log("listening on port 3000");
});
