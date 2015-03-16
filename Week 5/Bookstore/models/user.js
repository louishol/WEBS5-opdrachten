var bcrypt   = require('bcrypt-nodejs');
var _ = require('underscore');

var init = function(mongoose){
	var userSchema = mongoose.Schema({
		roles 			 : [String],
		local            : {
	        username     : String,
	        password     : String
	    },
		google           : {
			id           : String,
			token        : String,
			email        : String,
			name         : String
		}
	});

	// methods ======================
	// generating a hash
	userSchema.methods.generateHash = function(password) {
	    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	};

	// checking if password is valid
	userSchema.methods.validPassword = function(password) {
	    return bcrypt.compareSync(password, this.local.password);
	};

	userSchema.methods.hasAnyRole = function(roles){
		if(!Array.isArray(roles)){
			roles = [roles];
		}

		var lowerCaseRoles = _.map(this.roles, function(role){ return role.toLowerCase(); });
		for(var index in roles){
			if(_.contains(lowerCaseRoles, roles[index].toLowerCase())){
				// If any role matches, it's allright, we can return true;
				return true;
			}
		};

		return false;
	};

	userSchema.methods.hasAllRoles = function(roles){
		if(!Array.isArray(roles)){
			roles = [roles];
		}

		var lowerCaseRoles = _.map(this.roles, function(role){ return role.toLowerCase(); });
		for(var index in roles){
			if(!_.contains(lowerCaseRoles, roles[index].toLowerCase())){
				// If any role doesn't match, we can return false.
				return false;
			}
		};

		return true;
	};

	return mongoose.model('User', userSchema);
};

module.exports = init;