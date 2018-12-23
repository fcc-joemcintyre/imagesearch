const listener = require ('./listener');

/**
 * Initialize routes.
 * @param {Object} app Express instance
 * @returns {void}
 */
function init (app) {
  app.get ('/api/imagesearch/latest', listener.latest);
  app.get ('/api/imagesearch', listener.search);
}

exports.init = init;
