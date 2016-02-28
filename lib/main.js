/**
 * Copyright (c) Joe McIntyre, 2016
 * license: MIT (https://github.com/fcc-joemcintyre/imagesearch/LICENSE.txt)
 */
"use strict";
const processCommand = require ("./cmd").processCommand;
const server = require ("./server");

if (require.main === module) {
  main ();
}

/**
 * Process command line to start server.
 */
function main () {
  const command = processCommand (process.argv.slice (2));
  if (command.exit) {
    process.exit (command.code);
  }

  server.start (command.protocol, command.host, command.port, command.paas);
}
