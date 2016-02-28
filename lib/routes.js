/**
 * Copyright (c) Joe McIntyre, 2016
 * license: MIT (https://github.com/fcc-joemcintyre/imagesearch/LICENSE.txt)
 */

"use strict";

/**
 * Initialize routes.
 */
function init (app, listener) {
  app.get ("/", listener.homepage);
  app.get ("/api/imagesearch/latest", listener.latest);
  app.get ("/api/imagesearch", listener.search);
  app.use (listener.homepage);
}

exports.init = init;
