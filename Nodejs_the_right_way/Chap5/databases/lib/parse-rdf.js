"use strict";

const cheerio = require("cheerio");

module.exports = (rdf) => {
  const $ = cheerio.load(rdf);
  let body = {};

  body.id = +$("pgterms\\:ebook").attr("rdf:about").replace("ebooks/", "");

  body.title = $("dcterms\\:title").text();
  body.authors = $("pgterms\\:agent pgterms\\:name")
    .toArray()
    .map((elem) => $(elem).text());

  body.subjects = $('[rdf\\:resource$="/LCSH"]')
    .parent()
    .find("rdf\\:value")
    .toArray()
    .map((elem) => $(elem).text());

  return body;
};
