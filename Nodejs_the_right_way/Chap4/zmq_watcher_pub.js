"use strict";

const fs = require("fs");
const zmq = require("zeromq");

const filename = process.argv[2];

if (!filename)
  throw Error("File Name missing. Usage node net_watcher.js <file name>");

const publisher = zmq.socket("pub");

fs.watch(filename, () => {
  publisher.send(
    JSON.stringify({
      type: "changed",
      file: filename,
      timestamp: Date.now(),
    })
  );
});

publisher.bind("tcp://*:60401", (err) => {
  if (err) throw err;

  console.log("Listening for subscribers!.");
});
