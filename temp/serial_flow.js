/**
 * Node.js in Action -> Chapter 2.12 Implementation of serial flow control
 *
 * Flow Control - Ability to execute asynchronous task in a certain order. This example
 * covers the serial flow control where some(all) asynchronous tasks should be execute
 * in serial order.
 */
const fs = require("fs");
const request = require("request");
const htmlparser = require("htmlparser");
const configFile = "./rss_feeds.txt";

function checkForRssFile() {
  fs.stat(configFile, (err, stat) => {
    if (err || !stat.isFile())
      return next(new Error("Could not find config file: " + configFile));
    next(null, configFile);
  });
}

function readRssFile(configFile) {
  fs.readFile(configFile, (err, feedList) => {
    if (err) next(err);
    feedList = feedList
      .toString()
      .replace(/^\s+|\s+$/g, "")
      .split("\n");

    const idx = Math.floor(Math.random() * feedList.length);
    next(null, feedList[idx]);
  });
}

function downloadRssFile(url) {
  request({ uri: url }, (err, res, body) => {
    if (err) next(err);
    if (res.statusCode !== 200)
      next(new Error("Did not get proper response code."));

    next(null, body);
  });
}

function parseRssFeed(body) {
  const handler = new htmlparser.RssHandler();
  const parser = new htmlparser.Parser(handler);
  console.log(body);
  parser.parseComplete(body);

  if (!handler.dom.items.length) next(new Error("No Rss items found"));

  const item = handler.dom.items.shift();
  console.log(item.title);
  console.log(item.link);
}

tasks = [checkForRssFile, readRssFile, downloadRssFile, parseRssFeed];

function next(err, result) {
  if (err) throw err;
  let current = tasks.shift();
  if (current) current(result);
}

next();
