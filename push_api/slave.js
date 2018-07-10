var cp = require('child_process');
var net = require('net');
var os = require('os');
var http = require('http');
var url=require('url');
var qs = require('querystring');

var globalFun = require('./globalFun');
var serverLog = require('./serverLog');
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


//－－－－－－－－－－－－－ todo delete Test log
console.log("webServer started on " + process.pid);




// 接数用户操作
process.on("message", function(send2chilePara,socket) {
    process.nextTick(function(){
        if(socket) {
            socket.readable = socket.writable = true;
            socket.resume();
            // server.connections++;
            socket.server = http.createServer(function(req,res){
                var urlInfo = url.parse(req.url);
                var urlPara = qs.parse(urlInfo.query);

                dispose(res, urlPara,send2chilePara);
                
            });
            socket.server.emit("connection", socket);
            socket.emit("connect");
        }
    });
});
 
 // 处理传入内容
function dispose(res, urlPara, send2chilePara)
{
    // 添加用户
    if (1 == urlPara.ac_type) {
        addPerson(res, urlPara, send2chilePara);
    } else if (2 == urlPara.ac_type) {
        // 发送消息
        msg(res, urlPara,send2chilePara);
    } else {
        resEnd(res, '-1', send2chilePara);
    }

}

// 添加用户
function addPerson(res, urlPara, send2chilePara)
{
    if (urlPara.app_name != 'easyhint' || typeof urlPara.app_name == 'undefined')
    {
        resEnd(res,1,send2chilePara);
    }
    
}

// 发送消息
function msg(res, urlPara, send2chilePara)
{
    // push_equipment_type
    // push_msg_type
    // push_msg
    if (urlPara.app_name != 'easyhint' || typeof urlPara.app_name == 'undefined')
    {
        resEnd(res,1,send2chilePara);

    }
    if ('' == urlPara.push_obj || typeof urlPara.push_obj == 'undefined') {
        resEnd(res,2, send2chilePara);
    }
    if ('' == urlPara.push_msg || typeof urlPara.push_msg == 'undefined') {
        resEnd(res,3, send2chilePara);
    }

    serverLog.findOneSort('push_server_start_log', 'push_server_start_log', {}, {sort: [['server_start_time', 'desc']]}, function(result){ 

        serverLog.findAll('push_server_slave_list', 'push_server_slave_list', {'start_process_number' : result.start_process_number}, function(reslist){ 

            for(var key1 in reslist){
                forFun = function(tmpKey1){
                    tmpMsg = {"send_type":"msg","respcode":"1","push_obj":urlPara.push_obj,"push_equipment_type":"android","push_msg_type":1,"push_msg":urlPara.push_msg};

                    if ('ALL_USER' == urlPara.push_obj) {

                        redisEx.Qpush(reslist[tmpKey1].process_run_ip, reslist[tmpKey1].fock_name,tmpMsg,function(){
                            resEnd(res,200, send2chilePara);
                        });

                    }else {
                        serverLog.findOneSort('push_connect_user_list', 'push_connect_user_list', {'device_token' : urlPara.push_obj}, {sort: [['create_time', 'desc']]}, function(onePerson){ 
                            if (onePerson){
                                if (reslist[tmpKey1].process_run_ip  == onePerson.process_run_ip && reslist[tmpKey1].fock_name == onePerson.processName) {
                                    redisEx.Qpush(onePerson.process_run_ip, onePerson.processName,tmpMsg,function(){
                                        resEnd(res,200, send2chilePara);
                                    });
                                } else {
                                    
                                }
                            } else {
                                resEnd(res,200, send2chilePara);
                            }
                        });
                    }
                }
                forFun(key1);
            }
            callBackMasterQuit(send2chilePara.forkName,'');

        });
        
    });



}

// 发送反回结果
// 1 您的app 没有注册我们的服务
// 2 发送对像不能为空
// 3  消息内容不能为空
function resEnd(res,returnRes, send2chilePara)
{
    res.writeHead(200, {"Content-Type": "text/plain",         "Connection": "close"});
    res.end(returnRes +  '@' + Math.random());
}


// 退出回调
function callBackMasterQuit(childProcessName, msg_content)
{
    process.send({'msg_type' :1, 'childProcessName': childProcessName,"msg_content":msg_content});
}


