/**
 * Copyright (c) Joe McIntyre, 2016
 * license: MIT (https://github.com/fcc-joemcintyre/imagesearch/LICENSE.txt)
 */
"use strict";
const express = require ("express");
const routes = require ("./routes");
const listener = require ("./listener");

/**
 * Start the server.
 */
function start (protocol, host, port, paas) {
  console.log ("Starting Image Search server");

  // initialize and start server
  let app = express ();
  listener.init (protocol, host, port, paas);
  routes.init (app, listener);
  app.listen (port);

  console.log ("Image Search server listening on port " + port);
}

exports.start = start;
