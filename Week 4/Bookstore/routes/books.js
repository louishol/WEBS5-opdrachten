var express = require('express');
var router = express();
var Book;
var Author;
var _ = require('underscore');
var handleError;
var async = require('async');

/*
	TODO:
	- QueryString filter: topCategories={nummer}
		Tel alle boeken in een categorie
		Order deze categorie van meeste naar minste boeken
		Geef alleen de boeken terug die in de top {nummer} categorieën voorkomen
		(For now: Een boek kan maar 1 categorie hebben)

	// Ten slotte, een moeilijkere (door Async methodes)
	- Population: Vul alle autors van het boek
*/

function dynamicSort(property, reversed) {
    var sortOrder = 1;
    if(reversed) {
        sortOrder = -1;
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}


function getBooks(req, res){
	var query = {};

	if(req.params.id){
		query._id = req.params.id.toLowerCase();
	}

	var authors = Author.find();

	authors.exec(function(err, authors)
	{
		console.log(authors);

		var result 	= Book.find(query);

		result.exec(function(err, data){
			if(err){ return handleError(req, res, 500, err); }

			if(req.params.id){
				data = data[0];
			}

			if (req.query.topCategories)
			{
				var numberOfCategories 	= req.query.topCategories;
				var categories 			= [];
				var sortedCategories 	= [];
				var tempData 			= [];
				var foundCategorie 		= false;

				for (var i = 0; i < data.length; i++)
				{
					foundCategorie 		= false;
					for (var x = 0; x < categories.length; x++)
					{
						if (categories[x].name == data[i].category)
						{
							foundCategorie 			= true;
							categories[x].counted 	= (categories[x].counted + 1);
						}
					}

					if (!foundCategorie) 			{ categories.push({ name : data[i].category, counted : 1 }); }
				}

				categories.sort(dynamicSort("counted", true));

				for (var i = 0; i < numberOfCategories; i++) { sortedCategories.push(categories[i]); }

				for (var x = 0; x < sortedCategories.length; x++)
				{
					for (var i = 0; i < data.length; i++)
					{
						if (data[i].category == sortedCategories[x].name) 	{ tempData.push(data[i]); }
					}
				}

				data = tempData;

			}

			//append author to book
			for (var authorIndex = 0; authorIndex < authors.length; authorIndex++)
			{
				console.log("Looping for books of:");
				console.log(authors[authorIndex].books);
				for (var authorBookIndex = 0; authorBookIndex < authors[authorIndex].books.length; authorBookIndex++)
				{
					for (var bookIndex = 0; bookIndex < data.length; bookIndex++)
					{
						console.log("do we match:" + authors[authorIndex].books[authorBookIndex] + " : " +  data[bookIndex]._id);
						if (authors[authorIndex].books[authorBookIndex] == data[bookIndex]._id)
						{
							console.log("MATCH:" + authors[authorIndex].fullName);
							data[bookIndex].authors.push(authors[authorIndex].fullName);
						}
					}
				}
			}

			res.json(data);
		});
	});
}

// Routing
router.route('/')
	.get(getBooks);

router.route('/:id')
	.get(getBooks);

// Export
module.exports = function (mongoose, errCallback){
	console.log('Initializing books routing module');
	Book = mongoose.model('Book');
	Author = mongoose.model('Author');
	handleError = errCallback;
	return router;
};