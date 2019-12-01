//load database with meta data and initial random stock prices
const setup = require('../Setup');
const Promise = require('bluebird');
const redisConnection = Promise.promisifyAll(require('../redis-connection'));
const index = setup.createSearchIndex();
const max_length = setup.stockDataLength;
const nrpSender = require('../nrp-sender-shim');



//get suggestions/ search results

redisConnection.on('suggestions:request:*',async(message,_)=>{
    let requestId = message.requestId;
    let eventName = message.eventName;
    let successEvent = `${eventName}:success:${requestId}`;
    let failEvent = `${eventName}:failed:${requestId}`;
    let list = null;
    try{
        let list = await index.search({
            query: message.data.query,
            suggest:true,
            limit:10
        });
        let obj = [];
        for(let x = 0; x<list.length; ++x){
            // console.log(list[x]);
            let result = await nrpSender.sendMessage({
                redis: redisConnection,
                eventName: 'meta',
                data:{
                    id: parseInt(list[x])%max_length
                }
            });
            obj.push({
                _id: result._id,
                company: result.company,
                ticker: result.ticker
            });
           
        }
        redisConnection.emit(successEvent, {
            requestId: requestId,
            data: obj,
            eventName: eventName
          });
         
        //   console.log(list);
    }catch(e){
        console.log(e);
        
        redisConnection.emit(failEvent, {
            requestId: requestId,
            data: {status: 404, message: "suggestions not available"},
            eventName: eventName
          });
    }
});
