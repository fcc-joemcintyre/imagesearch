import express from 'express';
import http from 'http';
import { homepage } from './homepage.js';
import { init } from './routes.js';

let server;

/**
 * Start the server.
 * @param {string} protocol http or https
 * @param {string} host host name
 * @param {number} port HTTP port to listen to
 * @returns {void}
 */
export function start (protocol, host, port) {
  console.log ('Starting Image Search server');

  // initialize and start server
  const app = express ();
  init (app);

  const html = homepage (`${protocol}://${host}${host === 'localhost' ? `:${port}` : ''}`);
  app.get ('*', (req, res) => res.status (200).send (html));

  server = http.createServer (app);
  server.listen (port, () => {
    console.log (`Parsing server listening on port ${port}`);
  });
}

/**
 * Stop the server
 * @returns {Promise<void>}
 */
export async function stop () {
  if (server) {
    await server.close ();
  }
}
