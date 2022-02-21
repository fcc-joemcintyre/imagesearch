import { Express } from 'express';
import { latest, search } from './listener.js';

/**
 * Initialize routes.
 * @param app Express instance
 */
export function init (app: Express) {
  app.get ('/api/imagesearch/latest', latest);
  app.get ('/api/imagesearch', search);
}
