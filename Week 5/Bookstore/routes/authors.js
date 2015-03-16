var express = require('express');
var _ = require('underscore');
var router = express();
var Author;
var Book;
var handleError;

/*
	TODO:
	- Populate boeken
	- Paging:
		QueryString variabelen pageSize, PageIndex
		Gesorteerd op ranking
	- Filtering: QueryString variabele: country
	- Filtering: QueryString variabele: fullName
	- Projecting:
		fullname is een property die opgehaald wordt
		age is een property die opgehaald wordt
		numberOfBooks is een property die opgehaald wordt
*/
function getAuthors(req, res){
	var query = {};
	if(req.params.id){
		query._id = req.params.id;
	} 

	var result = Author.find(query).populate('books');

	if(req.query.pageIndex && req.query.pageSize){
		result = Author.findByPage(result, req.query.pageIndex, req.query.pageSize);
	} 
	if(req.query.country){
		result = Author.filterOnCountry(result, req.query.country);
	} 
	if(req.query.fullName){
		result = Author.filterOnFullName(result, req.query.fullName);
	} 

	result.exec(function(err, data){
		if(err){ return handleError(req, res, 500, err); }

		// We hebben gezocht op id, dus we gaan geen array teruggeven.
		if(req.params.id){
			data = data[0];
		}
		res.json(data);
	});
}

function getBooks(req, res){
	Author
		.findById(req.params.id)
		.populate('books')
		.exec(function(err, data){
			if(err){ return handleError(req, res, 500, err); }

			res.json(data);
		});
}

function addAuthor(req, res){
	var author = new Author(req.body);
	author.save(function(err, savedAuthor){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(201);
			res.json(savedAuthor);
		}
	});
}

/*
	TODO:
	- Vind Author
	- Book in collectie books aanmaken als die niet bestaat 
	- Book ID refereren vanuit Author
	- Author met nieuw book teruggeven
	- Mocht iets van dit mis gaan dan handleError(req, res, statusCode, err) aanroepen
*/
function addBook(req, res){
	Book.createIfNotExists(req.body, function(book){
		Author.findById(req.params.id, function(err, author){
			author.books.push(book._id);
			author.save();
		});
	});
}

/*
	TODO:
	- Vind Author by :id,
	- Vind Book bij author met :bookId,
	- Verwijder boek van Author
	- Author zonder betreffende book teruggeven
	- Mocht iets van dit mis gaan dan handleError(req, res, statusCode, err) aanroepen
*/
function deleteBook(req, res){
	Author.findById(req.params.id, function(err, author){
		var bookIndex = author.books.indexOf(req.params.bookId);
		if(bookIndex >= 0){
			author.books.splice(bookIndex, 1);
			author.save();
		}
	});
}

// Export
module.exports = function (model, role, errCallback){
	console.log('Initializing authors routing module');
	Author = model.Author;
	Book = model.Book;
	handleError = errCallback;
	
	// Routing
	router.route('/')
		.get(getAuthors)
		.post(addAuthor);

	router.route('/:id')
		.get(getAuthors);

	router.route('/:id/books')
		.get(role.can('view authors books'), getBooks)
		.post(role.can('edit authors books'), addBook);

	return router;
};