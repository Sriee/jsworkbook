"use strict";

const fs = require("fs");
const pkg = require("./package.json");
const program = require("commander");
const request = require("request");

program
  .version(pkg.version)
  .description(pkg.description)
  .usage("[options] <commands> [...]")
  .option("-o, --hostname <hostname>", "Hostname [localhost]", "localhost")
  .option("-p, --port <number>", "Port no [9200]", "9200")
  .option("-j, --json", "Format output as JSON", false)
  .option("-i, --index <name>", "Which index to use")
  .option("-t, --type <type>", "Default type for bulk operation")
  .option("-f, --filter <filter>", "Add Filter to query result")
  .option("--id <id>", "ID for the new index")
  .option("-d, --data <json-string>", "Data for inserting a document");

function fullURL(path = "") {
  let url = `http://${program.hostname}:${program.port}/`;
  if (program.index) {
    url += `${program.index}/`;
    if (program.type) url += `${program.type}/`;
    if (program.id) url += `${program.id}/`;
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
  .command("list-index")
  .alias("li")
  .description("List ES index")
  .action(() => {
    const path = fullURL(program.json ? "_all" : "_cat/indices");
    request.get({ url: path, json: program.json }, handleResponse);
  });

program
  .command("bulk <file>")
  .description("Inserting docs to ES in bulk")
  .action((file) => {
    if (!program.index) {
      handleError("ES Index name missing. Issue one using --index option");
      return;
    }

    fs.stat(file, (err, stats) => {
      if (err) {
        handleError(err);
        return;
      }

      let options = {
        url: fullURL("_bulk"),
        json: true,
        headers: {
          "content-length": stats.size,
          "content-type": "application/json",
        },
      };

      let post = request.post(options);
      const stream = fs.createReadStream(file);
      stream.pipe(post);
      post.pipe(process.stdout);
    });
  });

program
  .command("query [queries]")
  .alias("q")
  .description("Queries Elastic Search")
  .action((queries = []) => {
    let options = {
      url: fullURL(program.index ? `${program.index}/_search` : "_search"),
      json: program.json,
      qs: {},
    };

    if (queries && queries.length) options.qs.q = queries.join(" ");

    if (program.filter) options.qs._source = program.filter;

    request.post(options, handleResponse);
  });

program
  .command("delete-index")
  .alias("del")
  .description("Delete an Elastic Search index")
  .action(() => {
    if (!program.index) {
      handleError("ES Index name missing. Issue one using --index option");
      return;
    }

    request.del(
      {
        url: fullURL(),
        json: program.json,
      },
      handleResponse
    );
  });

program
  .command("put [file]")
  .description("Insert a document to an index")
  .action((file) => {
    if (!program.id)
      handleError("ID missing. Issue -id for the new document to insert");

    if (file) {
      fs.stat(file, (err, stats) => {
        if (err) {
          handleError(err);
          return;
        }

        let options = {
          url: fullURL(),
          json: true,
          headers: {
            "content-size": stats.size,
            "content-type": "application/json",
          },
        };

        const req = request.post(options);
        const stream = fs.createReadStream(file);
        stream.pipe(req);
        req.pipe(process.stdout);
      });
    } else {
      let options = {
        url: fullURL(),
        json: true,
        body: JSON.parse(program.data),
      };

      request.post(options, handleResponse);
    }
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
