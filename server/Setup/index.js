const data = require("../data");
const stockData = require("./data");
const stockDataLength = stockData.length;
const FlexSearch = require("flexsearch");
const loadDatabase = async ()=>{
    await data.drop();
    let count = 0;
    for(let count = 0; count<stockDataLength; ++count){
        await data.create(count,stockData[count].Symbol,stockData[count].Name,stockData[count].Sector);
    }
    
};

const createSearchIndex =  ()=>{
    let count = 0;
    var index = new FlexSearch({

        // default values:
    
        encode: "balance",
        tokenize: "full",
        threshold: 0,
        async: true,
        worker: false,
        cache: false
    });
    stockData.forEach(element=>{
        index.add(count,element.Name);
        index.add(count+stockData.length,element.Symbol);
        count+=1;
    });
    return index;
};

module.exports = {
    createSearchIndex,
    loadDatabase,
    stockDataLength,    
}


