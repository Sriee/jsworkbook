const ejs = require("ejs");
const path = require("path");
const logger  = require("morgan");
const express = require("express");
const zippDB = require("zippity-do-dah");
const forecastIO = require("forecastio");

import { api_router } from "./routers/api_routers";

var app = express();
var weather = new forecastIO("");

// Register api_routes
app.use("/api", api_router);

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
	var zipcode = req.params[0];	// Get zipcode from URI
	var location = zippDB.zipcode(zipcode);	// Get lat, long

	if(!location.zipcode) {
		next();
		return;
	}

	weather.forecast(location.latitude, location.longitude, (err, data) => {
		if(err) {
			next();
			return;
		}

		res.json({
			zipcode: zipcode,
			temperature: data.currently.temperature
		});
	});

});

// Last middleware to reach for wrong URI. Sends back 404
app.use((req, res) => {
	res.status(404).render("404");
});

/*
// Start Server
app.listen(3000, () => {
	console.log("tempForZip server started listening at port 3000.");
});
*/

module.exports = app;