var numCPUs = require('os').cpus().length;
var cp = require('child_process'); 
var net = require('net');
var globalFun = require('./globalFun');
// 生成CPU数量一样的worker
var workers = {};

/**
 * TODO 服务断开 日志
 *
 *
 */

start();

// 开启
function start()
{
    
    for (var i = 1; i <= numCPUs; i++) {
        fockKey = null;
        fockKey = 'fock_' + i;
        tmpWorder = null;

        tmpWorder = cp.fork('slave.js', [fockKey]);

        workers[fockKey] = {'clientNum':0, 'fockObj': tmpWorder};


        tmpWorder.on('message',function(callBackPara){
            msgTYpe = callBackPara.msg_type;
            if (1 == msgTYpe){
                // 断开修改子进程所在人数
                // 用户-1
                changePersonNum(callBackPara.childProcessName,2);
            } else if (2 == msgTYpe) {
                // other 
            } else {
                // other 
            }
         });
        tmpWorder = null;

    }
      
    // socket server 
    var server = net.createServer(function (socket) {
         socket.pause();
         var workerInfo = getOneWorder();

        // 用户+1
        changePersonNum(workerInfo.forkName,1);

         var worker = workerInfo.fockObj;
         var send2chilePara = {'forkName' : workerInfo.forkName};
         worker.send(send2chilePara,socket);
         
    });
    server.listen(2266);
}




//修改每个子进程人数
function changePersonNum(fock_name,ac_type)
{
    if (1 == ac_type) {
        workers[fock_name].clientNum++;
    } else {
        workers[fock_name].clientNum--;
    }
}

// 获得最空的一个worder 
function getOneWorder()
{
    var tmpMinNum = -1;
    var tmpMinNumKey = 0;

    for(worderKey in workers){
        if (-1 == tmpMinNum) {
            tmpMinNum = workers[worderKey].clientNum;
            tmpMinNumKey = worderKey;
        } else {
            if (workers[worderKey].clientNum < tmpMinNum){
                tmpMinNum = workers[worderKey].clientNum;
                tmpMinNumKey = worderKey;
            }
        }
    }
    return {'forkName':tmpMinNumKey , 'fockObj':workers[tmpMinNumKey].fockObj};
}




///////////////////////////////////////////////  监控输出       ///////////////////////////////////////////////


// 显示当前部分数使用
tm = require('timers'),
tm.setInterval(function () {
    var mem = process.memoryUsage();
    console.log('phy mem: ' + mem.rss + '; heap: ' + mem.heapTotal + '(' + (Math.ceil(mem.heapUsed/mem.heapTotal*1000) / 10) + '%)-' );

    for(worderKey in workers){
        console.log("workerKey : " + worderKey + "- " + workers[worderKey].clientNum);
    }

}, 1000);




