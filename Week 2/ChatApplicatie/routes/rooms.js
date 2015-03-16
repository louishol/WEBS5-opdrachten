var express 			= require('express');
var router 				= express.Router();

router.get('/', function(req, res)
{
	console.log("get?");
	var db 				= req.db;

	db.collection('rooms').find().sort(req.query.orderBy).toArray(function (err, rooms) { res.json({ rooms : rooms }); });
});

router.post('/', function(req, res)
{
	var db 				= req.db;

	db.collection('rooms').insert(req.body, function(err, result){
		if (err)        {  res.sendStatus(500); }
        else            {  res.sendStatus(201); }
	});
});

router.put('/', function(req, res)
{
	var db 				= req.db;

	db.collection('rooms').updateById(req.body.id, {$set:{name:req.body.name}}, function(err, result)
	{
		if (err)        {  res.sendStatus(304); }
        else            {  res.sendStatus(200); }
	});
});

router.delete('/', function(req, res)
{
	var db 								= req.db;
	var chatRoomId						= req.body.id;

	var users							= [];
	var usersInRoom						= [];
	
	db.collection('rooms').findById(chatRoomId, function (err, room)
	{
		if (err) 						{ res.sendStatus(500); }
		else if (room)
		{
			if (!room.lines) 			{ room.lines = []; }

			db.collection('users').find().toArray(function (err, users)
			{
				for (var index = 0; index < users.length; index++) 	{ users[index] = { id: users[index]._id, name: users[index].name  }; }

				for (var lineIndex = 0; lineIndex < room.lines.length; lineIndex++)
				{
					for (var userIndex = 0; userIndex < users.length; userIndex++)
					{
						if (room.lines[lineIndex].userId == users[userIndex].id
							&& usersInRoom.indexOf(users[userIndex]) === -1)
						{
							usersInRoom.push(users[userIndex]);
							break;
						}
					}
				}
				if (usersInRoom.length > 0) 		{ res.sendStatus(409); }
				else
				{
					db.collection('rooms').removeById(req.body.id, function(err, result)
					{
						if (err)       				 {  res.sendStatus(500); }
				        else           				 {  res.sendStatus(200); }
					});
				}

			});
		}
		else 										{ res.sendStatus(404); }
	});
});

router.get('/:id/Lines', function(req, res)
{
	var db 				= req.db;
	var chatRoomId 		= req.params.id;

	if (req.query.page && !isNaN(req.query.page)
		&& req.query.pageSize && !isNaN(req.query.pageSize))
	{
		var pagination 	= {
							skip 	: 	parseInt(req.query.pageSize * (req.query.page - 1)),
							limit 	: 	parseInt(req.query.pageSize)
						};

	}

	db.collection('rooms').findById(chatRoomId, function (err, room)
	{
		if (err) 						{ res.sendStatus(500); }
		else if (room)
		{
			if (!room.lines) 	{ room.lines = []; }

			if (pagination) 	{ room.lines = room.lines.slice(pagination.skip, (pagination.skip + pagination.limit)); }
			var userNames		= [];
			
			db.collection('users').find().toArray(function (err, users)
			{
				for (var index = 0; index < users.length; index++) 		{ userNames[index] = { id: users[index]._id, name: users[index].name  }; }

				for (var lineIndex = 0; lineIndex < room.lines.length; lineIndex++)
				{
					for (var usernameIndex = 0; usernameIndex < userNames.length; usernameIndex++)
					{
						if (room.lines[lineIndex].userId == userNames[usernameIndex].id)
						{
							room.lines[lineIndex].userName 	= userNames[usernameIndex].name;
							break;
						}
					}

					if (!room.lines[lineIndex].userName) 	{ room.lines[lineIndex].userName = ""; }
				}

				res.json({ lines : room.lines });
			});
		}
		else 				{ res.sendStatus(404); }
	});
});

router.post('/:id/Lines', function(req, res)
{
	var db 						= req.db;
	var chatRoomId 				= req.params.id;
	var chatRoom;

	db.collection('rooms').findById(chatRoomId, function (err, item) {
		if (err) 						{ res.sendStatus(500); }
		else if (item)
		{
			chatRoom 				= item;

			if (!chatRoom.lines) 	{ chatRoom.lines = []; }

			var userId 				= (req.body.userId 	|| "UnknownId" );
			var time 				= (req.body.time 	|| "UnknownTime");
			var text 				= (req.body.text 	|| "UnnownText");

			var newLine 			= {
										userId 	: 	userId,
										time 	:	time,
										text 	: 	text
									};

			chatRoom.lines.push(newLine);

			db.collection('rooms').updateById(chatRoomId, {$set:chatRoom} , function(err, result)
			{
				if (err)       	 	{  res.sendStatus(500); }
	        	else           		{  res.sendStatus(201); }
			});
		}
		else 						{ res.sendStatus(404); }
	});
});

router.get('/:id/Users', function(req, res)
{
	var db 						= req.db;
	var chatRoomId 				= req.params.id;

	db.collection('rooms').findById(chatRoomId, function (err, room)
	{
		if (err) 						{ res.sendStatus(500); }
		else if (room)
		{
			if (!room.lines) 		{ room.lines = []; }

			var users				= [];
			var usersInRoom			= [];
			
			db.collection('users').find().toArray(function (err, users)
			{
				for (var index = 0; index < users.length; index++) 	{ users[index] = { id : users[index]._id, name : users[index].name, image : users[index].image }; }

				for (var lineIndex = 0; lineIndex < room.lines.length; lineIndex++)
				{
					for (var userIndex = 0; userIndex < users.length; userIndex++)
					{
						if (room.lines[lineIndex].userId == users[userIndex].id
							&& usersInRoom.indexOf(users[userIndex]) === -1
							&& (!req.query.name || (req.query.name && req.query.name == users[userIndex].name)))
						{
							usersInRoom.push(users[userIndex]);
							break;
						}
					}
				}

				res.json({ users : usersInRoom });
			});
		}
		else 							{ res.sendStatus(404); }
	});
});

router.get('/:roomId/Users/:userId/Lines', function(req, res) {
	var db 				= req.db;
	var chatRoomId 		= req.params.roomId;
	var userId 			= req.params.userId;

	db.collection('rooms').findById(chatRoomId, function (err, room) {
		if (err) 						{ res.sendStatus(500); }
		else if (room)
		{
			if (!room.lines) 			{ room.lines = []; }

			var lines 					= [];
			
			db.collection('users').findById(userId, function (err, user) {
				if (user)
				{
					for (var lineIndex = 0; lineIndex < room.lines.length; lineIndex++)
					{
						if (room.lines[lineIndex].userId == userId) { lines.push({text : room.lines[lineIndex].text, time : room.lines[lineIndex].time}); }
					}

					res.json({ lines : lines });
				}
				else 					{ res.sendStatus(404); }
			});
		}
		else 							{ res.sendStatus(404); }
	});
});

module.exports = router;