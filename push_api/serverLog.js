var mongodb = require('mongodb');
var mongoHost = '10.88.88.161';
var monogoPort = 27017;

// insert
exports.qStop = false;

exports.sendLog =  function(dbName,tableName,sendArr, callBack)
{
	var server = new mongodb.Server(mongoHost,monogoPort,{auto_reconnect:true});
	var db = new mongodb.Db(dbName,server,{safe:true});
	db.open(function(err,db){
		if(!err)
		{   
			db.collection(tableName,{safe:true},function(err,collection){
				collection.insert(sendArr,{safe:true},function(err,result){
					// 回调
					if (typeof callBack !== 'undefined'){
			            callBack(result);
			        }
					server.close();
					
				}); 
			});
		}else{
			// todo err
			console.log(err);
		}   

	});
}

// update
exports.upDate =  function(dbName,tableName,setArr, whereArr, callBack)
{
	var server = new mongodb.Server(mongoHost,monogoPort,{auto_reconnect:true});
	var db = new mongodb.Db(dbName,server,{safe:true});
	db.open(function(err,db){
		if(!err)
		{   
			db.collection(tableName,{safe:true},function(err,collection){
				collection.update(whereArr,setArr,function(err,result){
					// 回调
					if (typeof callBack !== 'undefined'){
			            callBack(result);
			        }
					server.close();
					
				}); 
			});
		}else{
			// todo err
			console.log(err);
		}   

	});
}

// update
exports.findOne =  function(dbName,tableName,whereArr,callBack)
{
	var server = new mongodb.Server(mongoHost,monogoPort,{auto_reconnect:true});
	var db = new mongodb.Db(dbName,server,{safe:true});
	db.open(function(err,db){
		if(!err)
		{   
			db.collection(tableName,{safe:true},function(err,collection){
				collection.findOne(whereArr,function(err,result){

					callBack(result);
					// TODO close
					server.close();
					
				}); 
			});
		}else{
			// todo err
			console.log(err);
		}   

	});
}

// update
exports.findAll =  function(dbName,tableName,whereArr,callBack)
{
	var server = new mongodb.Server(mongoHost,monogoPort,{auto_reconnect:true});
	var db = new mongodb.Db(dbName,server,{safe:true});
	db.open(function(err,db){
		if(!err)
		{   
			db.collection(tableName,{safe:true},function(err,collection){
				collection.find(whereArr).toArray(function(err,result){
					callBack(result);
					// TODO close
					server.close();
					
				}); 
			});
		}else{
			// todo err
			console.log(err);
		}   

	});
}



// update
exports.findOneSort =  function(dbName,tableName,whereArr,sortArr,callBack)
{
	var server = new mongodb.Server(mongoHost,monogoPort,{auto_reconnect:true});
	var db = new mongodb.Db(dbName,server,{safe:true});
	db.open(function(err,db){
		if(!err)
		{   
			db.collection(tableName,{safe:true},function(err,collection){
				collection.findOne(whereArr,sortArr,function(err,result){

					callBack(result);
					// TODO close
					server.close();
					
				}); 
			});
		}else{
			// todo err
			console.log(err);
		}   

	});
}


