import { latest, search } from './listener.js';

/**
 * Initialize routes.
 * @param {Object} app Express instance
 * @returns {void}
 */
export function init (app) {
  app.get ('/api/imagesearch/latest', latest);
  app.get ('/api/imagesearch', search);
}
