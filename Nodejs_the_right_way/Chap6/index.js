"use strict";

const program = require("commander");
const request = require("request");
const pkg = require("./package.json");

program
  .version(pkg.version)
  .description(pkg.description)
  .usage("[options] <commands> [...]")
  .option("-o, --hostname <hostname>", "Hostname [localhost]", "localhost")
  .option("-p, --port <number>", "Port no [9200]", "9200")
  .option("-j, --json", "Format output as JSON", false)
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

program
  .command("get [path]")
  .description("get request to Elastic search cluster [default='/']")
  .action((path = "/") => {
    let options = {
      url: fullURL(path),
      json: program.json,
    };
    request.get(options, handleResponse);
  });

program
  .command("create-index")
  .description("Create an Elastic Search Index")
  .action(() => {
    if (!program.index) {
      handleError("ES Index name missing. Create one using --index option");
      return;
    }

    request.put({ url: fullURL(), json: program.json }, handleResponse);
  });

program
  .action("list-index")
  .alias("li")
  .description("List ES index")
  .action(() => {
    const path = fullURL(program.json ? "_all" : "_cat/indices");
    request.get({ url: path, json: program.json }, handleResponse);
  });

function handleError(err) {
  if (program.json) {
    if (err instanceof Error) {
      console.log(
        JSON.stringify({
          name: err.name,
          message: err.message,
          stack: err.stack,
        })
      );
    } else {
      console.log(JSON.stringify({ err: err }));
    }
  } else if (err instanceof Error) throw err;
  else throw Error(err);
}

function handleResponse(err, resp, body) {
  if (err) handleError(err);

  // console.log("Response Code: %d", resp.statusCode);

  if (program.json) {
    body = JSON.stringify(body);
    console.log(body);
  } else {
    console.log(body);
  }
}

program.parse(process.argv);
