"use strict";

const fs = require("fs");
const net = require("net");

const filename = process.argv[2];
const port = 60300;

if (!filename)
  throw Error("File Name missing. Usage node net_watcher.js <file name>");

const server = net.createServer((connection) => {
  console.log("Subscriber connected.");
  connection.write(`Now watching ${filename} for changes!..\n`);

  let watcher = fs.watch(filename, () => {
    connection.write(`File Changed ${new Date()}\n`);
  });

  connection.on("close", () => {
    console.log("Subscriber disconnected.");
    watcher.close();
  });

  connection.on("error", (err) => {
    console.log(err);
    watcher.close();
  });
});

server.listen(port, () => console.log("Listening for subscribers!.."));
