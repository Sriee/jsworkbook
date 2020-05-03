"use strict";

const cluster = require("cluster");
const zmq = require("zeromq");

if (cluster.isMaster) {
  const push = zmq.socket("push").bind("ipc://from_m_to_w.ipc");
  const pull = zmq.socket("pull").bind("ipc://from_w_to_m.ipc");

  let readyWorker = 0,
    workerCount = require("os").cpus().length;

  cluster.on("online", (worker) => {
    console.log(`Worker ${worker.process.pid} is online !..`);
  });

  pull.on("message", (data) => {
    let message = JSON.parse(data);
    if (message.type === "ready") {
      console.log("Incrementing readyWorker for " + message.pid);
      readyWorker++;
    } else if (message.type === "result") {
      if (readyWorker != workerCount)
        console.log("Received result message before workers are initialized.");
      else console.log(`${message.pid} processed: ${message.result}`);
    } else {
      console.log(`Received unrecognized message type: ${message.type}`);
    }
  });

  for (let i = 0; i < workerCount; i++) cluster.fork();

  let retry = setInterval(() => {
    if (readyWorker != workerCount) return;

    for (let i = 1; i <= 30; i++) {
      push.send(JSON.stringify({ pid: process.pid, job: `Job ${i}` }));
    }

    clearInterval(retry);
  }, 2000);
} else {
  const push = zmq.socket("push").connect("ipc://from_w_to_m.ipc");
  const pull = zmq.socket("pull").connect("ipc://from_m_to_w.ipc");

  pull.on("message", (msg) => {
    let message = JSON.parse(msg);

    console.log("Sending result back from %d", process.pid);
    push.send(
      JSON.stringify({
        type: "result",
        pid: process.pid,
        result: "Result for " + message.job,
      })
    );
  });

  push.send(JSON.stringify({ type: "ready", pid: process.pid }));
}
