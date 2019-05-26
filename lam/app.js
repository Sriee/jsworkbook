const mongoose = require("mongoose");
const path = require("path");
const express = require("express");
const session = require("express-session");
const ejs = require("ejs");
const logger = require("morgon");
const bodyParser = require("bodyParser");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const routes = require('./routes');
var app = express();

// Connect to Mongo DB
mongoose.connect("mongodb://localhost:27017/test");

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
app.use(routes);

app.listen(app.get("port"), () => {
	console.log("App server started at " + app.get("port"));
});