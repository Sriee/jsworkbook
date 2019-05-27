const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/users");

module.exports = function () {
	passport.serializeUser(function(user, done) {
  		done(null, user._id);
	});
 
	passport.deserializeUser(function(id, done) {
  		User.findById(id, function (err, user) {
    		done(err, user);
  		});
	});
};

passport.use("login", new LocalStrategy(
	function(username, password, done){
		User.findOne({ username:username }, function(err, user) {
			if(err) {
				return done(null, err);
			}

			if(!user) {
				return done(done, false, { message: "No user exists with that user name."});
			}

			User.checkPassword(password, function(err, isMatch) {
				if(err) {
					return done(err);
				}

				if(isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: "Invalid password!" });
				}
			});
		});
	})
);