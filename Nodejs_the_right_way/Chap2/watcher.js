"use strict";

const fs = require("fs");
const filename = process.argv[2];

if (!filename)
  throw Error("Missing argument 'filename'. Usage: node watcher.sj <filename>");

fs.watch(filename, () => {
  console.log(`${filename} changed!...`);
});

console.log(`Started watching ${filename} for changes!`);
