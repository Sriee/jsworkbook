const ejs = require("ejs");
const path = require("path");
const flash = require("connect-flash");
const logger = require("morgan");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


const routes = require('./routes');
const setupPassport = require("./setuppassport");

var app = express();

// Connect to Mongo DB
mongoose.connect("mongodb://localhost:27017/test");
setupPassport();

app.set("port", process.env.PORT || 3000);

// Set views folder
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

// Use morgon middleware for logging
app.use(logger("dev"));

// Use body parse middle ware for parsing 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	secret: "keyboard cat",
	resave: true,
	saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

// Last middleware to reach for wrong URI. Sends back 404
app.use((req, res) => {
	res.status(404).render("404");
});

app.listen(app.get("port"), () => {
	console.log("App server started at " + app.get("port"));
});