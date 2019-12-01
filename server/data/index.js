const stk =  require("./collections").stk;
var ObjectId = require('mongodb').ObjectID;

const create_object = function create_object(ticker,company, sector){	
	return {
		
		ticker: ticker,
		company: company,
		price: Math.Random()*1000.0,
		sector: sector,
		open: Math.Random()*1000.0,
		yield:Math.Random()*10.0,
		marketCap: Math.Random()*100000000000.0
	};

};
const create = async function create(ticker,company, sector){
	var obj = create_object(ticker,company, sector);
	const ac = await stk();
	const insertInfo = await ac.insertOne(obj);
	if(insertInfo.insertedCount==0){
		throw "Could not add animal";
	}
	return await ac.findOne({_id: insertInfo.insertedId});
};


const getByTicker = async function getByTicker(ticker){


	const ac = await stk();
	const stkResult = await ac.findOne({ticker:ticker});
	if(stkResult===null){
		throw ("no stock with given ticker "+ticker);
	}
	return stkResult;
};

const getByCompany = async function getByCompany(company){


	const ac = await stk();
	const stkResult = await ac.findOne({company:company});
	if(stkResult===null){
		throw ("no stock with given company "+company);
	}
	return stkResult;
};
const getByID = async function getByID(ID){
	const ac = await stk();
	const stkResult = await ac.findOne({_id : ObjectId(id)});
	if(stkResult===null){
		throw ("no stock with given id "+id);
	}
	return stkResult;
}

module.exports = {
	
	create,
	getByTicker,
	getByCompany,
	getByID


}