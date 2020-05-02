"use strict";

const cluster = require("cluster");
const fs = require("fs");
const zmq = require("zeromq");

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running.`);
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
      console.log(`${process.pid} sending response!`);
      if (err) {
        worker.send(
          JSON.stringify({
            err: err,
            content: null,
            timestamp: Date.now(),
            pid: process.pid,
          })
        );
        return;
      }

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

function terminate() {
  if (!cluster.isMaster) return;

  console.log(`Terminating Workers`);
  let promiseArray = [];

  for (const id in cluster.workers) {
    let worker = cluster.workers[id],
      timeout;

    worker.kill();

    promiseArray.push(
      new Promise((resolve) => {
        worker.on("exit", () => {
          console.log(`Worker ${worker.process.pid} exited.`);
          resolve();
        });
      })
    );
  }

  Promise.all(promiseArray).then(() => {
    console.log("Bye!...");
    process.exit(0);
  });
}

process.on("SIGINT", terminate);
