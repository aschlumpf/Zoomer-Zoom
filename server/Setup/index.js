const data = require("../data");
const stockData = require("./data");
const stockDataLength = stockData.length;
const FlexSearch = require("flexsearch");
const loadDatabase = async ()=>{
    let count = 0;
    stockData.forEach(async (element) => {
        await data.create(count,element.Symbol,element.Name,element.Sector);
        count+=1;
    });
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


