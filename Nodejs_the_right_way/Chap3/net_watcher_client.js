"use strict";

const netClient = require("net").connect({ port: 60300 });
const ldjClient = require("./lib/ldj-client").connect(netClient);

ldjClient.on("message", (message) => {
  if (message.type === "watching") {
    console.log(`Now watching ${message.file}`);
  } else if (message.type === "changed") {
    const date = new Date(message.timestamp);
    console.log(`File Changed: ${date}`);
  } else {
    console.log(`Invalid error message type ${message.type}`);
  }
});
