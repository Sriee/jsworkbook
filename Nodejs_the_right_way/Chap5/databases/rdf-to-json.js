"use strict";

const fs = require("fs");
const parseRDF = require("./lib/parse-rdf");
const filename = process.argv[2];

if (!filename)
  throw Error("File name missing. Usage rdf-to-json <file_name>.rdf");

const rdf = fs.readFileSync(filename);
let book = parseRDF(rdf);

console.log(JSON.stringify(book, null, " "));
