const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");


var userSchema = mongoose.userSchema({
	username: { type: String, required: true, unique: true },
	password: { type:String, required: true },
	createdAt: { type: Date, default: Date.now },
	displayName: String,
	bio: String
});

// Return user name or display name
userSchema.methods.name = () => {
	return this.displayName || this.username;
};

// Compute Hash while Pre-saving to the database
userSchema.pre("save", (done) => {
	var user = this;

	// If the password for the user is not modified then don't need to do anything
	// should call done to break out of async call
	if(!user.isModified(user.password)){
		return done();
	}

	// Generate salt and hash for the password
	bcrypt.genSalt(10, (err, salt) => {
		if(err) {
			return done(err);
		}

		bcrypt.hash(user.password, salt, (err, hashedPassword) => {
			if(err) {
				return done(err);
			}
			user.password = hashedPassword;
			done();
		});
	});
});


userSchema.methods.checkPassword = (guess done) => {
	bcrypt.compare(guess, (err, isMatch)=> {
		done(err, isMatch);
	});
};

export var User = mangoose.model("User", userSchema);
