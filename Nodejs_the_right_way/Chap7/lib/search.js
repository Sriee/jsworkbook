const request = require("request");

module.exports = (app, es) => {
  const url = `http://${es.hostname}:${es.port}/${es.book_index}/books/_search/`;

  app.get("/api/search/books/:field/:query", (req, res) => {
    let options = {
      url: url,
      json: true,
      body: {
        size: 10,
        query: {
          match: {
            [req.params.field]: req.params.query,
          },
        },
      },
    };

    request.get(options, (err, esResp, esRespBody) => {
      if (err) {
        res.status(502).json({
          error: "Bad Gateway",
          reason: err.code,
        });
        return;
      }

      if (esResp.statusCode !== 200) {
        res.status(esResp.statusCode).json(esRespBody);
        return;
      }

      res.status(200).json(esRespBody.hits.hits.map(({ _source }) => _source));
    });
  });

  app.get("/api/suggest/:field/:query", (req, res) => {
    const promise = new Promise((resolve, reject) => {
      let options = {
        url: url,
        json: true,
        body: {
          size: 0,
          suggest: {
            suggestions: {
              text: req.params.query,
              term: {
                field: req.params.field,
                suggest_mode: "always",
              },
            },
          },
        },
      };

      request.get(options, (err, esResp, esRespBody) => {
        if (err) {
          reject({ error: err });
          return;
        }

        if (esResp.statusCode !== 200) {
          reject({ status: esResp.statusCode, error: esRespBody });
          return;
        }

        resolve(esRespBody);
      });
    });
    promise
      .then((esRespBody) => {
        res.status(200).json(esRespBody.suggest.suggestions);
      })
      .catch(({ error }) => {
        res.status(error.status || 502).json(error);
      });
  });
};
