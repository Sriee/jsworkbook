const express = require("express");

var api = express.Router();

api.use((req, res, next) => {
	next();
});

api.get("/v1", (req, res) => {
	res.status(200).send("You have accessed /api/v1.");
});

api.get("/v1/status", (req, res) => {
	res.status(200).send("You have accessed /api/v1/status.")
});

module.exports = api;