"use strict";

const program = require("commander");
const pkg = require("./package.json");

program
  .version(pkg.version)
  .description(pkg.description)
  .usage("[options] <commands> [...]")
  .option("-o, --hostname <hostname>", "Hostname [localhost]", "localhost")
  .option("-p, --port <number>", "Port no [9200]", "9200")
  .option("-j, --json", "Format output as JSON")
  .option("-i, --index <name>", "Which index to use")
  .option("-t, --type <type>", "Default type for bulk operation");

function fullURL(path = "") {
  let url = `http://${program.hostname}:${program.port}/`;
  if (program.index) {
    url += `${program.index}/`;
    if (program.type) url += `${program.type}/`;
  }

  return url + path.replace(/^\/*/, "");
}

program
  .command("url [path]")
  .description("generate the URL for option and path [default = '/']")
  .action((path = "/") => console.log(fullURL(path)));
program.parse(process.argv);
