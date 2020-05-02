"use strict";

const EventEmitter = require("events").EventEmitter;

class LDJClient extends EventEmitter {
  constructor(stream) {
    if (!stream)
      throw TypeError(
        "Invalid Stream object. Stream can't be null or undefined"
      );

    super();
    let buffer = "";

    stream.on("data", (data) => {
      if (!data) {
        this.emit("error", "Error! Malformed input.");
        buffer = "";
      }

      buffer += data;
      let boundary = buffer.indexOf("\n");
      while (boundary !== -1) {
        let input = buffer.substring(0, boundary);
        buffer = buffer.substring(boundary + 1);
        boundary = buffer.indexOf("\n");
        try {
          input = JSON.parse(input);
          this.emit("message", input);
        } catch (error) {
          this.emit("error", "Error! Malformed input.");
        }
      }
    });
  }

  static connect(stream) {
    return new LDJClient(stream);
  }
}

module.exports = LDJClient;
