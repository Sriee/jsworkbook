"use strict";

const net = require("net");
const client = net.connect({ port: 60300 });

client.on("data", (data) => {
  let message = JSON.parse(data);

  if (message.type === "watching") {
    console.log(`Now watching ${message.file}`);
  } else if (message.type === "changed") {
    const date = new Date(message.timestamp);
    console.log(`File Changed: ${date}`);
  } else {
    console.error(`Invalid error message type ${message.type}`);
  }
});
