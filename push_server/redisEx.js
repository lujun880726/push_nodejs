var redis   = require('redis');
var mongoHost = '10.88.88.161';
var monogoPort = 6379;
// 队列状态
var qState = false;


// 消耗队列

exports.setQState = function(){
    qState = true 
}

exports.executeＱ = function(processName, localIP, sendAll, sendOne)
{
    this.qStop = false;
   
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
            redisGetData();
            
        }
    });

    // 获取队列
    function redisGetData()
    {
        if (true  == qState){
            // TODO close
            redisClient.close();
            console.log(localIP + ':' + processName + '-Q end');
        } else {
            redisClient.lpop(redisQKey, function(error, res){
                if(error) {
                    console.log(error);
                }
                // 发送消息
                pushMsg(res);

            });
        }
    }


    // 发送消息
    function pushMsg(msg)
    {
        if (msg == null) {
            // without Q information
        } else {
            msgInfo = JSON.parse(msg);
            if ('ALL_USER' == msgInfo.push_obj) {
                sendAll(msg);
            } else {
                sendOne(msg);
            }

            
        }
        redisGetData();
        
    }

}
