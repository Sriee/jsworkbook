"use strict";

const net = require("net");

const server = net.createServer((connection) => {
  console.log("Subscriber connected.");

  const chunk1 = '{"type": "changing", "time';
  const chunk2 = `stamp": 1450694371194}\n`;

  connection.write(chunk1);

  const timer = setTimeout(() => {
    connection.write(chunk2);
    connection.end();
  }, 100);

  connection.on("end", () => {
    clearInterval(timer);
    console.log("Subscriber disconnected.");
  });
});

server.listen(60300, () => console.log("Listening for subscribers!.."));
