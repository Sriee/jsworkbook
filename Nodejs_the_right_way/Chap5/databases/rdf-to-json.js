"use strict";

const dir = require("node-dir");
const parseRDF = require("./lib/parse-rdf");
const dirname = process.argv[2];

if (!dirname)
  throw Error("Directory name missing. Usage rdf-to-json <dirname>");

const options = {
  match: /\.rdf$/,
  exclude: ["pg0.rdf"],
};

dir.readFiles(dirname, options, (err, content, next) => {
  if (err) throw err;

  let book = parseRDF(content);
  console.log(JSON.stringify({ index: { _id: "pg" + book.id } }));
  console.log(JSON.stringify(book));
  next();
});
