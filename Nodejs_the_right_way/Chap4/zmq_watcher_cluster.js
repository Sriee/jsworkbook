"use strict";

const cluster = require("cluster");
const fs = require("fs");
const zmq = require("zeromq");

if (cluster.isMaster) {
  const router = zmq.socket("router").bind("tcp://*:60401");
  const dealer = zmq.socket("dealer").bind("ipc://filer.ipc");

  router.on("message", (...frames) => dealer.send(frames));
  dealer.on("message", (...frames) => router.send(frames));

  const workersCount = require("os").cpus().length;

  cluster.on("online", (worker) => {
    console.log(`Worker ${worker.process.pid} is online !..`);
  });

  for (let i = 0; i < workersCount; i++) {
    cluster.fork();
  }
} else {
  const worker = zmq.socket("rep").connect("ipc://filer.ipc");

  worker.on("message", (message) => {
    let request = JSON.parse(message);
    console.log(`${process.pid} received request for: ${request.path}`);

    fs.readFile(request.path, (err, content) => {
      if (err) throw err;

      console.log(`${process.pid} sending response!`);
      worker.send(
        JSON.stringify({
          content: content.toString(),
          timestamp: Date.now(),
          pid: process.pid,
        })
      );
    });
  });
}
