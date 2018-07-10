var numCPUs = require('os').cpus().length;
var	cp = require('child_process'); 
var	net = require('net');
var serverLog = require('./serverLog');
var globalFun = require('./globalFun');
// 生成CPU数量一样的worker
var workers = {};

/**
 * TODO 服务断开 日志
 *
 *
 */

// 启动服务id 
var startProcessNumber = process.argv[2];
if (!startProcessNumber) {
    console.log('请输入启动服务号');
    process.reallyExit();
}

//确认是否是同一服务ID号
serverLog.findOne('push_server_start_log','push_server_start_log',{ "start_process_number": startProcessNumber,'server_run_ip' : globalFun.getLocalIP()},function(p_info){
    if (null == p_info){
        inArr = {'start_process_number' : startProcessNumber,'server_start_time' :globalFun.getNowTime(),'server_run_ip' : globalFun.getLocalIP()};
        serverLog.sendLog('push_server_start_log','push_server_start_log',inArr);
        start();
    } else {
        console.log('[' + startProcessNumber + ']启动服务号已被使用或本机已开启此服务');
        process.reallyExit();
    }
    
});

// 开启
function start()
{

    for (var i = 1; i <= numCPUs; i++) {
    	fockKey = 'fock_' + i;

        tmpWorder = cp.fork('slave.js', [fockKey, startProcessNumber]);
        
        workers[fockKey] = {'clientNum':0, 'fockObj': tmpWorder};

        processInfo(startProcessNumber,fockKey);

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

    }
      
    // socket server 
    var server = net.createServer(function (socket) {
         socket.pause();
         var workerInfo = getOneWorder();
        // 用户+1
        changePersonNum(workerInfo.forkName,1);

         var worker = workerInfo.fockObj;
         var send2chilePara = {'forkName' : workerInfo.forkName,'startProcessNumber':startProcessNumber};
         worker.send(send2chilePara,socket);
    });
    server.listen(2277);
}




//修改每个子进程人数
function changePersonNum(fock_name,ac_type)
{
    if (1 == ac_type) {
        upProcessPersonNum(startProcessNumber,fock_name,1);
        workers[fock_name].clientNum++;
    } else {
        upProcessPersonNum(startProcessNumber,fock_name,2);
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

// 初始进程信息
function processInfo(start_process_number,fock_name)
{
    inArr = {'start_process_number':start_process_number,'fock_name':fock_name,'process_run_ip': globalFun.getLocalIP(),'process_type' : 2, 'person_num' : 0 , 'create_time' : globalFun.getNowTime(), 'update_time' : '','connection_end_time':'','quit_end_time':'','close_time':''};
    serverLog.sendLog('push_server_slave_list','push_server_slave_list',inArr);
}

// 更新mongodb中进程人数  ac_type 1 +  ,2 -
function upProcessPersonNum(start_process_number,fock_name,ac_type)
{
    if (1 == ac_type) {
        setArr = {'$inc':{'person_num':1},'$set' :{'update_time':globalFun.getNowTime(),'connection_end_time':globalFun.getNowTime()}};
    } else {
        setArr = {'$inc':{'person_num':-1},'$set' :{'quit_end_time':globalFun.getNowTime()}};
    }
    
    whereArr = {'start_process_number':start_process_number,'fock_name':fock_name,'process_run_ip': globalFun.getLocalIP()}
    serverLog.upDate('push_server_slave_list', 'push_server_slave_list',setArr, whereArr);
}


///////////////////////////////////////////////  监控输出		///////////////////////////////////////////////


// 显示当前部分数使用
tm = require('timers'),
tm.setInterval(function () {
    var mem = process.memoryUsage();
    console.log('phy mem: ' + mem.rss + '; heap: ' + mem.heapTotal + '(' + (Math.ceil(mem.heapUsed/mem.heapTotal*1000) / 10) + '%)-' );

    for(worderKey in workers){
    	console.log("workerKey : " + worderKey + "- " + workers[worderKey].clientNum);
	}

}, 2000);




