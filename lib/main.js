import { processCommand } from './cmd.js';
import { start } from './server.js';

/**
 * Process command line, and start server.
 * @returns {void}
 */
function main () {
  const command = processCommand (process.argv.slice (2));
  if (command.exit) {
    process.exit (command.code);
  }

  start (command.protocol, command.host, command.port);
}

main ();
