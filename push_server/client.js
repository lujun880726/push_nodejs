var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();


event.on('new_client', function(myId){
	newClient(myId);
});

tempMax = 1;

var device_token = process.argv[2].toString();
if (!device_token){
	console.log('没有 device_token');
    process.reallyExit();
}

for (var i = 1; i <= tempMax; i++) 
{
	event.emit('new_client', i);
}


function newClient(myId)
{
	var port = 3000;
	var host = '10.88.88.128';

	var client= new require('net').Socket();
	client.setEncoding('utf-8');

	//连接到服务端
	client.connect(port,host,function(){

	    //client.write(myId + ":" + client.localPort + '- send msg ');
	    client.write('{"send_type":"auth","device_token": "'+ device_token +'","app_name": "easyhint"}');

	});

	client.on('data',function(data){
	    console.log('recv data:'+ data);

	   // client.write('{"device_token":"abadf32123123133312312"}');

	});
	client.on('error',function(error){

	    console.log('error:'+error);
	   // client.destory();

	});
	client.on('close',function(){

	    console.log('Connection closed');

	    newClient(myId);
	});
}

	// server = require('net').createConnection(3000, '127.0.0.1');

	// server.on('connect', function(socket){
	// 	// socket.on('getData', function(socket, chunk){

	// 	socket.write(myId + ':'socket.localPort + ': send msg ');
	// 	// });

 // 		console.log(socket.localAddress + ':' + socket.localPort + '~' + myId);

 // 		socket.on('data',function(socket,chunk){

	// 		socket.emit('getData', function(socket, chunk){

	// 			socket.write(socket.localPort + ': send msg ');
	// 		});

	// 	});
		
	// });

// function getData(ts, ss, chunk)
// {
// 	console.log(chunk + ss.localPort);

// 	ss.write(ss.localAddress + ':' + ss.localPort +'-- send message to server' + ts + '^^^' +Math.random());
// }

// function newClient(connectNum,ss){
// 	// ss.on('data',function(connectNum,ss){
// 	// 	console.log(connectNum + '~'+clientArr.length  + ss.localPort);
// 	 	ss.write(ss.localAddress + ':' + ss.localPort +'-- send message to server' + connectNum + '^^^' +Math.random());


// 	// });
// 	// console.log(connectNum + '~'+clientArr.length  + ss.localPort);

// 	// clientArr[ii].on('data', function(){

//  //   		sleep(1000);
// 	// console.log(clientArr[ii].localAddress + ':' + clientArr[ii].localPort);
// 	//     clientArr[ii].write(clientArr[ii].localAddress + ':' + clientArr[ii].localPort +'-- send message to server' + ii + '^^^' +Math.random());
// 	// });
// 	// clientArr[ii].on('connect', function(){
// 	// 	 console.log(clientArr[ii].localAddress + ':' + clientArr[ii].localPort + '~' + ii);
// 	// 	//console.log(Math.random());
// 	//     clientArr[ii].write(' clent send message to server'+ ii + '^^^' +Math.random() + '\r\n');
// 	// });
// }

function sleep(milliSeconds){
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
}


