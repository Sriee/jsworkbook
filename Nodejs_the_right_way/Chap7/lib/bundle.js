"use strict";

const rp = require("request-promise");

module.exports = (app, es) => {
  const url = `http://${es.hostname}:${es.port}/${es.bundle_index}/bundle`;

  app.post("/api/bundle", (req, res) => {
    let options = {
      url: url,
      json: true,
      body: {
        name: req.query.name || "",
        books: [],
      },
    };

    rp.post(options)
      .then((esRespBody) => res.status(201).json(esRespBody))
      .catch(({ error }) => res.status(error.status || 502).json(error));
  });

  app.get("/api/bundle/:id", async (req, res) => {
    try {
      const esRespBody = await rp({
        url: `${url}/${req.params.id}`,
        json: true,
      });
      res.status(200).json(esRespBody);
    } catch (esRespErr) {
      res.status(esRespErr.statusCode || 502).json(esRespErr.error);
    }
  });

  app.put("/api/bundle/:id/name/:name", async (req, res) => {
    try {
      // Get existing document for :id
      let bundle = (
        await rp({
          url: `${url}/${req.params.id}`,
          json: true,
        })
      )._source;

      bundle.name = req.params.name;

      let esRespBody = await rp.put({
        url: `${url}/${req.params.id}`,
        json: true,
        body: bundle,
      });

      res.status(200).json(esRespBody);
    } catch (esRespErr) {
      res.status(esRespErr.statusCode || 502).json(esRespErr.error);
    }
  });
};
