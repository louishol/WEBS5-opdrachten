module.exports = function (server)
{
	var app 										= require('express')();
	var http 		 								= require('http');
	var request 									= require('request');
	var io 											= require('socket.io')(server);

	var host 										= 'http://localhost:3000';

	updateRooms 									= function ()
	{
		http.get(host + '/rooms', function (res)
		{
			var data 								= '';

		    res.on('data', function (chunk) 		{ data += chunk; });

		    res.on('end', function () 				{ io.emit('rooms', data); });
		}
		).on('error', function (e) 					{ console.log("Error on getRooms: " + e.message); });
	};

	updateUsersInRoom 								= function (roomId)
	{
		var clients 		= io.sockets.adapter.rooms[roomId]; 
		var usersInRoom 	= [];

		for (var clientId in clients ) { usersInRoom.push(io.sockets.connected[clientId].userName); }

		io.to(roomId).emit('users', usersInRoom);
	};

	sendMessagesOfRoomToClientId 					= function (roomId, clientId)
	{
		http.get(host + '/Rooms/' + roomId + '/Lines', function (res)
		{
			var data 								= '';

		    res.on('data', function (chunk) 		{ data += chunk; });

		    res.on('end', function () 				{ io.sockets.connected[clientId].emit('messages', data); });
		}
		).on('error', function (e) 					{ console.log("Error on getMessagesOfRooms: " + e.message); });
	};

	recieveMessage 									= function (socket, text, userName, time)
	{
		var doneFunction = function ()
		{
			request.post(
				host + '/Rooms/' + socket.roomId + '/Lines',
				{ form : 	{
							text : text,
							time : time,
							userId : socket.userId
							}
				},
				function (error, response, body)
				{
					io.to(socket.roomId).emit('message', JSON.stringify({ text : text, userName : userName, time : time }));
				}
			);
		};

		getIdOfUsernameAndUpdateUsername(socket, userName, doneFunction);
	};

	getIdOfUsernameAndUpdateUsername 				= function (socket, userName, doneFunction)
	{
		http.get(host + '/Users', function (res)
		{
			var data 								= '';

		    res.on('data', function (chunk) 		{ data += chunk; });

		    res.on('end', function ()
		    {
		    	var users 							= JSON.parse(data).users;
		    	var socketUserId 					= socket.userId;

		    	if (!socket.userId && socket.userName == userName)
		    	{
		  			for (var i = 0; i < users.length; i++)
		  			{
		  				if (users[i].name == userName)
		  				{
		  					socket.userId 			= users[i]._id;
		  					doneFunction();
		  					return;
		  				}
		  			}
		    	}

				//update the username
		  		if (socketUserId)
		  		{
		  			request.put(host + '/Users', {form : { id : socketUserId, name : userName } }, function (error, response, body) { doneFunction(); });
		  		}
		  		//else add a new user, and retrieve the userId
		  		else
		  		{
			  		request.post(host + '/Users', {form : { name : userName } }, function (error, response, body) { return getIdOfUsernameAndUpdateUsername(socket, userName, doneFunction); });
		  		}
		   	});
		}
		).on('error', function (e) 						{ console.log("Error on getMessagesOfRooms: " + e.message); });
	};

	io.on('connection', function (socket)
	{	
		updateRooms();

		socket.on('message', function (userData)
		{
			userData 									= JSON.parse(userData);

			recieveMessage(socket, userData.text, userData.userName, userData.time);
		});

		socket.on('add room', function (roomname)
		{
			request.post(host + '/rooms', {form : { name : roomname } }, function (error, response, body) { updateRooms(); });
		});

		socket.on('enter room', function (userData)
		{
			userData 									= JSON.parse(userData);
			socket.userName 							= userData.userName;
			socket.roomId 								= userData.roomId;

			if (socket.currentRoom)
			{
				socket.leave(socket.currentRoom);
				updateUsersInRoom(socket.currentRoom);
			}

			socket.join(userData.roomId);
			socket.currentRoom 							= userData.roomId;

			updateUsersInRoom(userData.roomId);
			sendMessagesOfRoomToClientId(socket.roomId, socket.id);
		});

		socket.on('disconnect', function () 			{ updateUsersInRoom(socket.roomId); });
	});
};