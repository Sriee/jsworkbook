const ejs = require("ejs");
const path = require("path");
const logger  = require("morgan");
const express = require("express");
const zippDB = require("zippity-do-dah");
const forecaseIO = require("forecastio");


var app = express();
var weather = forecaseIO("");

// Setup EJS as views
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");

// Logger middle ware
app.use(logger("dev"));

// Serve static pages
app.use(express.static(path.resolve(__dirname, "public")));

// Serve home page
app.get("/", (req, res) => {
	res.render("index");
});

// Zip code to Temperature conversion 
app.get(/^\/(\d{5})$/, (req, res, next) => {

});

// Last middleware to reach for wrong URI. Sends back 404
app.use((req, res) => {
	res.status(404).render("404");
});

// Start Server
app.listen(3000, () => {
	console.log("tempForZip server started listening at port 3000.");
});