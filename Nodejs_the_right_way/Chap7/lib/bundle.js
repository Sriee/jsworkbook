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

  app.put("/api/bundle/:id/book/:pgid", async (req, res) => {
    const bundleURL = `${url}/${req.params.id}`;
    const bookURL = `http://${es.hostname}:${es.port}/${es.book_index}/books/${req.params.pgid}`;

    try {
      const [
        { _source: bundleRespBody, _version: version },
        { _source: bookRespBody },
      ] = await Promise.all([
        rp({ url: bundleURL, json: true }),
        rp({ url: bookURL, json: true }),
      ]);

      if (
        bundleRespBody.books.findIndex(
          (book) => book.id === req.params.pgid
        ) === -1
      ) {
        bundleRespBody.books.push(bookRespBody);
      }

      const updateResp = await rp.put({
        url: bundleURL,
        qs: { version },
        json: true,
        body: bundleRespBody,
      });

      res.status(200).json(updateResp);
    } catch (esRespErr) {
      res.status(esRespErr.statusCode || 502).json(esRespErr.error);
    }
  });

  app.delete("/api/bundle/:id", async (req, res) => {
    try {
      const bundleResp = await rp.del({
        url: `${url}/${req.params.id}`,
        json: true,
      });
      res.status(200).json(bundleResp);
    } catch (esRespErr) {
      res.status(esRespErr.statusCode || 502).json(esRespErr.error);
    }
  });

  app.delete("/api/bundle/:id/book/:pgid", async (req, res) => {
    const bundleURL = `${url}/${req.params.id}`;
    const bookURL = `http://${es.hostname}:${es.port}/${es.book_index}/books/${req.params.pgid}`;

    try {
      const [
        { _source: bundleRespBody, _version: version },
        { _source: bookRespBody },
      ] = await Promise.all([
        rp({ url: bundleURL, json: true }),
        rp({ url: bookURL, json: true }),
      ]);

      const idx = bundleRespBody.books.findIndex(
        (book) => book.id === bookRespBody.id
      );
      if (idx !== -1) {
        bundleRespBody.books.splice(idx, 1);

        const updateResp = await rp.put({
          url: bundleURL,
          qs: { version },
          json: true,
          body: bundleRespBody,
        });

        res.status(200).json(updateResp);
      } else {
        res.status(409).json({
          error: `Book ${req.params.pgid} does not exists in the bundle. Ignoring delete!`,
        });
      }
    } catch (esRespErr) {
      res.status(esRespErr.statusCode || 502).json(esRespErr.error);
    }
  });
};
