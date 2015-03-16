function init(mongoose){
	console.log('Iniializing books schema');

	var bookSchema = new mongoose.Schema(
	{
		_id				: { type: String, required: true, unique: true, lowercase: true },
		title 			: { type: String, required: true },
		publishDate 	: { type: Date, required: true },
		category 		: { type: String, required: true },
		chapters 		: [
							{
								title 			: { type: String },
								numberOfPages 	: { type: Number }
							}
							]
	},
	{ // settings:
		toObject 		: { virtuals: true },
		toJSON 			: { virtuals: true }
	}
	);

	//validators
	bookSchema.path('publishDate').validate(function(publishDate){
		return (publishDate < new Date());
	}, 'Publishdate must be prior to today.');

	//Virtuals
	bookSchema.virtual('totalNumberOfPages').get(function ()
	{
		var chapters 				= this.chapters;
		var totalNumberOfPages 		= 0;

		for (var i = 0; i < chapters.length; i++)
		{
			totalNumberOfPages += chapters[i].numberOfPages;
		}

		return totalNumberOfPages;
	});

	bookSchema.virtual('authors').get(function ()
	{
		return [];
	});	

	bookSchema.statics.createIfNotExists = function(book){
		course._id = book._id.toLowerCase();
		this.findById(book._id, function(err, existingBook){
			if (!existingBook)
			{
				var Book = mongoose.model('Book');
				new Book(book).save();
			}
		});
	};

	mongoose.model('Book', bookSchema);

	/*
	TODO: Validation
	- Title: Verplicht, String
	- PublishDate: Verplicht, Date, voor vandaag
	- Category: Verplicht, String
	- Chapters: Array van JSNON { title, numberOfPages }
	*/

	/*
	TODO: 
	- De benodigde virtuals (Onder andere totalNumberOfPages, opgebouwd uit numberOfPages van chapters)
	- De benodigde extra validation
	- De benodigde static methods <- find BY title, pagination, etc.
	- De benodigde instance methods
	*/
}

module.exports = init;