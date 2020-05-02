"use strict";

const zmq = require("zeromq");
const path = process.argv[2];

if (!path)
  throw Error(
    "Missing file path. Usage: node zmq_watcher_req.js <file path to watch>."
  );

const request = zmq.socket("req");

request.on("message", (message) => {
  let response = JSON.parse(message);

  if (response.err) {
    console.log(response.err);
  } else {
    console.log(
      `Got response from ${response.pid}: Content: ${
        response.data
      }, Time Stamp: ${new Date(response.timestamp)}`
    );
  }
});

request.connect("tcp://localhost:60401");

for (let i = 1; i < 6; i++) {
  if (i % 2 == 0) {
    console.log(`Sending incorrect request no: ${i}`);
    request.send(JSON.stringify({ path: "error.txt" }));
  } else {
    console.log(`Sending request no: ${i}`);
    request.send(JSON.stringify({ path: path }));
  }
}

process.on("SIGINT", () => {
  console.log(`Terminating Watcher Request`);
  request.disconnect("tcp://localhost:60401");
  request.close();
  process.exit(0);
});
