"use strict";

const assert = require("assert");
const EventEmitter = require("events").EventEmitter;
const LDJClient = require("../lib/ldj-client.js");

describe("LDJClient", () => {
  let client = null,
    stream = null;

  beforeEach(() => {
    stream = new EventEmitter();
    client = new LDJClient(stream);
  });

  it("Should emit message for single data event", (done) => {
    client.on("message", (message) => {
      assert.deepEqual(message, { foo: "bar" });
      done();
    });

    stream.emit("data", '{"foo": "bar"}\n');
  });

  it("Should emit message for split data event", (done) => {
    client.on("message", (message) => {
      assert.deepEqual(message, { foo: "bar" });
      done();
    });

    stream.emit("data", '{"foo"');
    process.nextTick(() => {
      stream.emit("data", ': "bar"}\n');
    });
  });

  it("Should emit error message for malformed data event", (done) => {
    client.on("message", (message) => {
      assert.equal(message, null);
    });

    client.on("error", (err) => {
      assert.deepEqual(err, "Error! Malformed input.");
      done();
    });

    stream.emit("data", "{foo");
    process.nextTick(() => {
      stream.emit("data", ': "bar"}\n');
    });
  });

  it("Should emit error message for null data event", (done) => {
    client.on("error", (err) => {
      assert.deepEqual(err, "Error! Malformed input.");
      done();
    });

    stream.emit("data", null);
  });

  it("Should throw an error for null stream", (done) => {
    assert.throws(
      () => {
        new LDJClient(null);
      },
      TypeError,
      "Invalid Stream object. Stream can't be null or undefined"
    );

    assert.throws(
      () => {
        new LDJClient(undefined);
      },
      TypeError,
      "Invalid Stream object. Stream can't be null or undefined"
    );

    done();
  });
});
