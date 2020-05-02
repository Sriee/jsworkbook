"use strict";

const zmq = require("zeromq");

const subscriber = zmq.socket("sub");

subscriber.subscribe("");

subscriber.on("message", (msg) => {
  let data = JSON.parse(msg);
  let date = new Date(data.timestamp);
  console.log(`File ${data.file} ${data.type} at ${date}`);
});

subscriber.connect("tcp://localhost:60401");
