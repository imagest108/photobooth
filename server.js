var http = require("http");
var fs = require("fs");
var httpServer = http.createServer(requestHandler);
httpServer.listen(8080);

function requestHandler (req, res){

	fs.readFile(__dirname + '/index.html',
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading index.html');
			}

			res.writeHead(200);
			res.end(data);
		});
}

var io = require('socket.io').listen(httpServer);

var user = new Array();
var images = new Array();

io.sockets.on('connection',


		// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);
		user[user.length] = socket.id;
		var filename = socket.id;

		console.log(user.length);
		
		// loop through images emit one at time
		for(var i = 0; i < images.length; i++){
			socket.emit('image', images[i]);
		}
		

		// When this user "send" from clientside javascript, we get a "message"
		// client side: socket.send("the message");  or socket.emit('message', "the message");
		socket.on('message', 
			// Run this function when a message is sent
			function (data) {
				console.log("message: " + data);
				
				// Call "broadcast" to send it to all clients (except sender), this is equal to
				// socket.broadcast.emit('message', data);
				socket.broadcast.send(data);
				
				// To all clients, on io.sockets instead
				// io.sockets.emit('message', "this goes to everyone");
			}
		);
		
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('image', function(data) {

			// Data comes in as whatever was sent, including objects
			images.push(data);
			console.log("images array is here: "+ images.length);
			console.log("Received: 'image' ");
			socket.broadcast.emit('image', data);			
		});
		
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected");
		});
	}

);