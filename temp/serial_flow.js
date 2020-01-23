/**
 * Node.js in Action -> Chapter 2.12 Implementation of serial flow control
 *
 * Flow Control - Ability to execute asynchronous task in a certain order. This example
 * covers the serial flow control where some(all) asynchronous tasks should be execute
 * in serial order.
 */
const fs = require("fs");
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
    if (err) return next(err);
    feedList = feedList.toString().split("\n");

    const idx = Math.floor(Math.random() * feedList.length);
    next(null, feedList[idx]);
  });
}

function showRandomlink(url) {
  console.log(url);
}

tasks = [checkForRssFile, readRssFile, showRandomlink];

function next(err, result) {
  if (err) throw err;
  let current = tasks.shift();
  if (current) current(result);
}

next();
