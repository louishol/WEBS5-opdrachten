var Book, Author;

function saveCallback(err){
	if(err){
		console.log('Fill testdata failed, reason: %s', err)
	}
};


function fillTestBooks(callback){
	var today = new Date();
	today.setDate(today.getDate() - 100);

	var testData = [
		// Vul hier je testdata voor boeken in 
		{
		_id				: "book1",
		title 			: "BooksForLife",
		publishDate 	: today,
		category 		: "horror",
		chapters 		: [
							{
								title 			: "Intro",
								numberOfPages 	: 10
							},
							{
								title 			: "Chapter 1",
								numberOfPages 	: 10
							},
							{
								title 			: "Chapter 2",
								numberOfPages 	: 155
							}
							]
		},
		{
		_id 			: "book2",
		title 			: "BooksForLife22",
		publishDate 	: today,
		category 		: "horror",
		chapters 		: [
							{
								title 			: "Intro",
								numberOfPages 	: 1
							},
							{
								title 			: "Chapter 1",
								numberOfPages 	: 10
							},
							{
								title 			: "Chapter 2",
								numberOfPages 	: 15
							}
							]
		},
		{
		_id 			: "book3",
		title 			: "BooksForLife232",
		publishDate 	: today,
		category 		: "horror2",
		chapters 		: [
							{
								title 			: "Intro",
								numberOfPages 	: 1
							},
							{
								title 			: "Chapter 1",
								numberOfPages 	: 10
							},
							{
								title 			: "Chapter 2",
								numberOfPages 	: 15
							}
							]
		},
		{
		_id 			: "book4",
		title 			: "BooksForLife2442",
		publishDate 	: today,
		category 		: "horror3",
		chapters 		: [
							{
								title 			: "Intro",
								numberOfPages 	: 1
							},
							{
								title 			: "Chapter 1",
								numberOfPages 	: 10
							},
							{
								title 			: "Chapter 2",
								numberOfPages 	: 15
							}
							]
		},
		{
		_id 			: "book5",
		title 			: "BooksForLife22",
		publishDate 	: today,
		category 		: "horror2",
		chapters 		: [
							{
								title 			: "Intro",
								numberOfPages 	: 1
							},
							{
								title 			: "Chapter 1",
								numberOfPages 	: 10
							},
							{
								title 			: "Chapter 2",
								numberOfPages 	: 15
							}
							]
		},
		{
		_id 			: "book6",
		title 			: "BooksForLife22",
		publishDate 	: today,
		category 		: "horror",
		chapters 		: [
							{
								title 			: "Intro",
								numberOfPages 	: 1
							},
							{
								title 			: "Chapter 1",
								numberOfPages 	: 10
							},
							{
								title 			: "Chapter 2",
								numberOfPages 	: 15
							}
							]
		}
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

		if(callback){ callback(); }
	});
};

function fillTestAuthors(callback){
	var today = new Date();
	today.setDate(today.getDate() - 8400);

	var testData = [
		// Vul hier je testdata voor authors in 
		{
		_id				: "author1",
		firstName 		: "Test",
		lastName 		: "Testers",
		birthDate 		: today,
		country 		: "BE",
		ranking 		: 0,
		books 			: ["book1", "book2"]
		},
		{
		_id				: "author2",
		firstName 		: "Halloooo",
		lastName 		: "Testers",
		birthDate 		: today,
		country 		: "NL",
		ranking 		: 1,
		books 			: ["book3"]
	},
		{
		_id				: "author3",
		firstName 		: "Halwewewewe",
		lastName 		: "Testers",
		birthDate 		: today,
		country 		: "NL",
		ranking 		: 1,
		books 			: ["book4", "book5", "book6"]
	}
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

		if(callback){ callback(); }
	});
};

module.exports = function(mongoose){
	Book = mongoose.model('Book');
	Author = mongoose.model('Author');

	fillTestBooks(fillTestAuthors);
}