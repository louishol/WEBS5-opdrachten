var async = require('async');

function saveCallback(err){
	if(err){
		console.log('Fill testdata failed, reason: %s', err)
	}
};


function fillTestBooks(Book, done){
	var testData = [
		{ _id: 'book1', title: 'My first book', publishDate: new Date('2010-01-01'), category: 'fantasy', chapters: [{ title: 'Chapter 1', numberOfPages: 10 }, { title: 'Chapter 2', numberOfPages: 15 }]},
		{ _id: 'book2', title: 'My second book', publishDate: new Date('2011-01-01'), category: 'thriller', chapters: [{ title: 'Intro', numberOfPages: 2 }, { title: 'Main', numberOfPages: 20 }]},
		{ _id: 'book3', title: 'My third book', publishDate: new Date('2012-01-01'), category: 'drama', chapters: [{ title: 'Start', numberOfPages: 8 }, { title: 'End', numberOfPages: 30 }]},
		{ _id: 'book4', title: 'His first book', publishDate: new Date('2013-01-01'), category: 'horror', chapters: [{ title: 'Begin', numberOfPages: 10 }, { title: 'Finale', numberOfPages: 15 }]},
		{ _id: 'book5', title: 'His second book', publishDate: new Date('2014-01-01'), category: 'biography', chapters: []},
	];

	Book.find({}, function(err, data){
		// Als er nog geen boeken zijn vullen we de testdata
		if(data.length == 0){
			console.log('Creating books testdata');
			
			testData.forEach(function(book){
				new Book(book).save(saveCallback);
			});
		} else{
			console.log('Skipping create courses testdata, allready present');
		}
	});

	done();
};

function fillTestAuthors(Author, done){
	var testData = [
		{ _id: 'me', firstName: 'Martijn', lastName: 'Schuurmans', birthDate: new Date('1988-04-27'), country: 'NL', ranking: 1, books: ['book1', 'book2', 'book3']},
		{ _id: 'him', firstName: 'Someone', middleName: 'called', lastName: 'He', birthDate: new Date('1968-12-22'), country: 'EN', ranking: 2, books: ['book4', 'book5']}
	];

	Author.find({}, function(err, data){
		// Als er nog geen author zijn vullen we de testdata
		if(data.length == 0){
			console.log('Creating authors testdata');
			
			testData.forEach(function(author){
				new Author(author).save(saveCallback);
			});
		} else{
			console.log('Skipping create courses testdata, allready present');
		}

		done();
	});
};

module.exports = function(model){
	async.waterfall([
		function(done){ fillTestBooks(model.Book, done); },
		function(done){ fillTestAuthors(model.Author, done); }
	]);
}