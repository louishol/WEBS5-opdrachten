function init(mongoose){
	console.log('Iniializing author schema');

	var authorSchema = new mongoose.Schema(
	{
		_id				: { type: String, required: true, unique: true, lowercase: true },
		firstName 		: { type: String, required: true },
		lastName 		: { type: String, required: true },
		birthDate 		: { type: Date, required: true },
		country 		: { type: String, default: "NL" },
		ranking 		: { type: Number, unique: true, min: 0 },
		books 			: [{ type: String, required: true, ref: 'Book' /* Pseudo-joins */ }]
	},
	{ // settings:
		toObject 		: { virtuals: true },
		toJSON 			: { virtuals: true }
	}
	);

	//validators
	authorSchema.path('birthDate').validate(function (birthDate)
	{
		return (birthDate < new Date());
	}, 'Birthdate must be prior to today.');


	//Virtuals
	authorSchema.virtual('fullName').get(function ()
	{
		return this.firstName + ' ' + this.lastName;
	});

	authorSchema.virtual('age').get(function ()
	{
		return new Date(new Date - this.birthDate).getFullYear()-1970;
	});

	//statics
	authorSchema.statics.findByPage = function(result, pageIndex, pageSize){
		if(!result){ result = this.find(); }

		return result
			.sort({ _id: 1 })
			.limit(pageSize)
			.skip(pageIndex * pageSize)
	};

	authorSchema.statics.filterOnCountry = function(result, country){
		if(!result){ result = this.find(); }

		return result.where('country').equals(country.toUpperCase());
	};

	authorSchema.statics.filterOnFullName = function(result, fullName){
		if(!result){ result = this.find(); }

		var name = fullName.split(' ');

		console.log(name[0]);
		console.log(name[1]);

		return result.where('firstName').equals(name[0]).where('lastName').equals(name[1]);
	};

	authorSchema.statics.createIfNotExists = function (author)
	{
		author._id 		= author._id.toLowerCase();
		this.findById(author._id, function (err, existingAuthor)
		{
			if (!existingAuthor)
			{
				var Author = mongoose.model('Author');
				new Author(author).save();
			}
		});
	};

	mongoose.model('Author', authorSchema);

	/*
	TODO: Validation
	- Firstname: Verplicht, String
	- Lastname: Verplicht, String
	- Birthdate: Verplicht, Date, voor vandaag
	- Country: String, default: NL
	- Ranking: Number, unique, boven 0
	- Books: Array van book id's
	*/

	/*
	TODO: 
	- De benodigde extra validation
	- De benodigde static methods
	- De benodigde instance methods
	*/
}

module.exports = init;