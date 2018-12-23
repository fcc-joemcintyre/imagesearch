const express = require ('express');
const http = require ('http');
const homepage = require ('./homepage').homepage;
const routes = require ('./routes');

let server;

/**
 * Start the server.
 * @param {string} protocol http or https
 * @param {string} host host name
 * @param {number} port HTTP port to listen to
 * @returns {void}
 */
function start (protocol, host, port) {
  console.log ('Starting Image Search server');

  // initialize and start server
  const app = express ();
  routes.init (app);

  const html = homepage (`${protocol}://${host}${host === 'localhost' ? `:${port}` : ''}`);
  app.get ('*', (req, res) => res.status (200).send (html));

  server = http.createServer (app);
  server.listen (port, () => {
    console.log (`Parsing server listening on port ${port}`);
  });
}

/**
 * Stop the server
 * @returns {void}
 */
async function stop () {
  if (server) {
    await server.close ();
  }
}

exports.start = start;
exports.stop = stop;
