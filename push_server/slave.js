var cp = require('child_process');
var net = require('net');
var os = require('os');

var serverLog = require('./serverLog');
var globalFun = require('./globalFun');
var redisEx = require('./redisEx');


// 连接上来的socket 不代表是用户， 登录成功后会在此去除在userArr 中存在
var connectionArr = {};

// 只有正常用户
var userArr = {};

// 本机ip
var localIP = globalFun.getLocalIP();

// 本子进程名称
var processName = process.argv[2];

//服务号ＩＤ
var startProcessNumber = process.argv[3];;






///////////////////////////////////////////////  监控输出 ///////////////////////////////////////////////

// 显示当前部分数使用
tm = require('timers'),
tm.setInterval(function () {
     for(tmpPort in connectionArr){
         console.log('['+processName+ ']' + 'connect list  : ' + tmpPort + "- " + connectionArr[tmpPort]);
     }
    for(deviceToken in userArr){
        console.log('['+processName+ ']' +'user list  : ' + deviceToken + "- " + userArr[deviceToken]);
    }
}, 2000);

// 清理无用的连接
//setInterval
//setTimeout
tm.setTimeout(function(){
    tm.setInterval(function () {
        tmpconnectionArr = connectionArr;
        delCNUum = 0;

        for(tmpCKey in tmpconnectionArr){
            nowTime = globalFun.getNowTime();
            pastDueTime = nowTime - 5;
            
            //TODO clear connection buy not login client       
            if (tmpconnectionArr[tmpCKey].connectTime < pastDueTime){
                tmpconnectionArr[tmpCKey].socketRes.end();
                delete connectionArr[tmpCKey];
            }
        }
    }, 5000);
}, 10000);

///////////////////////////////////////////////////////////


//－－－－－－－－－－－－－ todo delete Test log
console.log("webServer started on " + process.pid );

// 接数用户操作
process.on("message", function(send2chilePara,socket) {
    // 操作
    userＣonnect(send2chilePara,socket);
	// TODO  不知何意 process.nextTick
});

// 新用户连上来
function userＣonnect(send2chilePara,socket){

    // init information
    var clientIP = socket.remoteAddress;
    var clientPost = socket.remotePort;
    // 连接用户列表 记录端口号和进入时间
    connectionArr[clientIP+':'+clientPost]={'connectTime':globalFun.getNowTime(),'socketRes' : socket};

    // sokcet init information
    socket.setEncoding('utf-8');

    // 连接log
    initLog = {
            'startProcessNumber':startProcessNumber,
            'processName':processName,
            'process_run_ip' : localIP,
            'device_token' : '',
            'uid' : '',
            'clientIP' : clientIP,
            'clientPost' : clientPost, 
            'state' : 0,  // 0 创建 1 登录，2离开
            'create_time' : globalFun.getNowTime(),
            'login_time' : '',
            'Heartbeat_last_time':'',
            'quit_time': '',
            'update_time' :'',
        };

    serverLog.sendLog('push_connect_user_list','push_connect_user_list', initLog);

    // socket 事件

    // 获取数据
    socket.on('data', function onData(chunk) {

        //  TODO telnet ctrl +C 或终端关闭时报错 
        if (!chunk) {
            return '';
        }
        dateJson = JSON.parse(chunk);  

        if ('auth' == dateJson.send_type) {

            // 判断此设备是否是我们的用户  dateJson.device_token  去验证
            serverLog.findOne('user_device_token','user_device_token',{'app_name': dateJson.app_name.toString(), "device_token": dateJson.device_token.toString()},function(devuceInfo){
                // 不存在
                if (null == devuceInfo){
                    authReturn = {"send_type":"auth",'device_token' : dateJson.device_token, 'respcode' : '0', 'respdesc' : '登录失败'}; 
                    
                    sendMsg(socket,authReturn, true);

                } else {
                    // 存在
                    authReturn = {"send_type":"auth",'device_token' : dateJson.device_token, 'respcode' : '1', 'respdesc' : '登录成功'}; 
                    
                    sendMsg(socket,authReturn);

                    device_token = dateJson.device_token;
                    // // 加入用户列表
                    // if (typeof userArr[device_token] !== 'undefined'){
                    //    userArr[device_token].res.end();
                    // }

                    userArr[device_token] = {'res':socket, 'login_time':globalFun.getNowTime()};
                    // 在连接列表清除
                    delete connectionArr[clientIP+':'+clientPost];

                    // 登录更新
                    setArr ={'$set':{'device_token' : dateJson.device_token.toString(),'uid' : devuceInfo.uid.toString() ,'app_name': dateJson.app_name,'state':1,'login_time' : globalFun.getNowTime(), 'update_time' : globalFun.getNowTime()}};
                    whereArr = {'startProcessNumber':startProcessNumber,'processName':processName,'clientIP' : clientIP,'clientPost' : clientPost};
                    serverLog.upDate('push_connect_user_list','push_connect_user_list',setArr, whereArr);
                }
                
            });

        } else if('Heartbeat' == dateJson.send_type){
            // TODO 心跳

            // 心跳更新
            setArr ={'$set':{'Heartbeat_last_time' : globalFun.getNowTime(), 'update_time' : globalFun.getNowTime()}};
            whereArr = {'startProcessNumber':startProcessNumber,'processName':processName,'clientIP' : clientIP,'clientPost' : clientPost};
            serverLog.upDate('push_connect_user_list','push_connect_user_list',setArr, whereArr);

            authReturn = {"send_type":"Heartbeat",'device_token' : dateJson.device_token, 'respcode' : '1', 'respdesc' : '心跳成功', 'login_token' : Math.random()}; // 是否需要 login_token
                    
            sendMsg(socket,authReturn);

        } else {
            
            // 非正常操作
            authReturn = {"send_type":"msg",'device_token' : dateJson.device_token, 'respcode' : '0', 'respdesc' : '非法操作'}; 
            sendMsg(socket,authReturn, true);
        }
    });

    // 半闭
    socket.on('close', function(socket){
        // 清除用户列表
        if (typeof device_token !== 'undefined'){
            delete userArr[device_token];
        }
        // 离开日志更新
        setArr ={'$set':{'state':2,'quit_time' : globalFun.getNowTime(), 'update_time' : globalFun.getNowTime()}};
        whereArr = {'startProcessNumber':startProcessNumber,'processName':processName,'clientIP' : clientIP,'clientPost' : clientPost};
        serverLog.upDate('push_connect_user_list','push_connect_user_list',setArr, whereArr);
        // TODO 清除在此状态
　
        // 回调主进程进行人数修正
        callBackMasterQuit(send2chilePara.forkName,'');
    });

    // TODO  异常
    socket.on('error', function (err) {
        console.log(err);
    });


}

// 发送消息
function sendMsg(socket,dataObj,closeFlag) {

    sendMsgString = JSON.stringify(dataObj);
    socket.write(sendMsgString + '\0');
    if (typeof closeFlag !== 'undefined'){
        socket.end();
    }
}

// 退出回调
function callBackMasterQuit(childProcessName, msg_content)
{
    process.send({'msg_type' :1, 'childProcessName': childProcessName,"msg_content":msg_content});
}


// 死循环读取 redis Q 
redisEx.executeＱ(
    processName, 
    globalFun.getLocalIP(), 
    function(msg,callBack)
    {
        // 发送全部用户
        tmpUserArr = userArr;
        for(tmpDeviceToken in userArr){
            sendMsg(userArr[tmpDeviceToken].res,JSON.parse(msg));
         }
         tmpUserArr = null;
    }, 
    function(msg,callBack)
    {
        msgInfo = JSON.parse(msg);
        if (typeof userArr[msgInfo.push_obj] !== 'undefined'){
            sendMsg(userArr[msgInfo.push_obj].res,JSON.parse(msg));
            msgInfo = null;
        }
    }
);
