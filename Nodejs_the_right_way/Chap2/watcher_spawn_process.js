"use strict";

const fs = require("fs");
const spawn = require("child_process").spawn;
const filename = process.argv[2];

const args = process.argv.slice(3);
args.push(filename);

if (!filename)
  throw Error("Missing argument 'filename'. Usage: node watcher.sj <filename>");

fs.watch(filename, () => {
  // const ls = spawn("ls", ["-l", "-h", filename]);
  const ls = spawn("ls", args);
  let output = "";
  ls.stdout.on("data", (chunk) => {
    output += chunk;
  });

  ls.on("close", () => {
    if (output !== "") {
      const parts = output.split(" ");
      console.log([parts[0], parts[2], parts[8].trim()]);
    }
  });
})
  .on("change", (eventType, file) => {
    console.log(`${eventType} happened on ${file}`);
  })
  .on("error", (err) => {
    throw err;
  });

console.log(`Started watching ${filename} for changes!`);
