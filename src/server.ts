import express from 'express';
import http from 'http';
import { homepage } from './homepage.js';
import { init } from './routes.js';

let server: http.Server;

/**
 * Start the server.
 * @param protocol http or https
 * @param host host name
 * @param port HTTP port to listen to
 */
export function start (protocol: string, host: string, port: number) {
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
 */
export async function stop () {
  if (server) {
    await server.close ();
  }
}
