var http = require("http");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var path = require("path");

var app = express();


// Make the entries local to all views
var entries = []
app.locals.entries = entries

// Set EJS as our view rendering engine 
app.set("views", path.resolve(__dirname, "views"));	// Path to view directory
app.set("view engine", "ejs");

// Logging middleware
app.use(logger("dev"));

// POST body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));


app.get("/", (req, res) => {
	res.render("index");
});

app.get("/new-entry", (req, res) => {
	res.render("new-entry");
});

app.post("/new-entry", (req, res) => {
	if(!req.body.title || !req.body.body) {
		res.status(400).send("Entries must have body and title");
		return;
	} else {
		entries.push({
			title: req.body.title,
			content: req.body.body,
			published: new Date()
		});
	}
	res.redirect("/");
});

app.use((req, res) => {
	res.status(404).render("404");
});

http.createServer(app).listen(3000, () => {
	console.log("Guest Book server has started at port 3000.");
});