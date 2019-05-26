const express = require("express");
const User = require("./models/users");

const router = express.Router();

router.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.errors = req.flash("error");
	res.locals.infos = req.flash("info");
	next();
});


router.get("/", (req, res, next) => {
	User.find()
	.sort({ createdAt: "decending" })
	.exec((err, users) => {
		if(err) {
			return next(err)
		}
		res.render("index", { users: users });
	});
});

export { router as routes };