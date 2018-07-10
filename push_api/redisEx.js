var redis   = require('redis');
var mongoHost = '10.88.88.161';
var monogoPort = 6379;


// 推送
exports.Qpush = function(localIP, processName,setArr,pushCallBack)
{
   
    var redisClient  = redis.createClient(monogoPort, mongoHost);
    redisClient.on("error", function(error) {
        console.log(error);
    });

    // 当前队列key 名字
    var redisQKey = localIP + ':' + processName;
    redisClient.select('0', function(error){
        if(error) {
            console.log(error);
        } else {
            setArrString = JSON.stringify(setArr);  
            redisClient.rpush(redisQKey,setArrString, function(error, res){
                if(error) {
                    console.log(error);
                }
                if (typeof pushCallBack !== 'undefined'){
                    pushCallBack(res);
                }
                redisClient.end();
            });
        }
    });

 



}
