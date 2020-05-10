"use strict";

const pkg = require("./package.json");
const nconf = require("nconf");
const express = require("express");
const morgan = require("morgan");

nconf.argv().env("__");
nconf.defaults({ conf: `${__dirname}/config.json` });
nconf.file(nconf.get("conf"));

const app = express();
app.use(morgan("dev"));

const search = require("./lib/search")(app, nconf.get("es"));

app.get("/api/version", (req, res) => res.status(200).send(pkg.version));

app.listen(nconf.get("port"), () => console.log("Ready"));
