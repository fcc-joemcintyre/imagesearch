import { Request, Response } from 'express';
import fetch from 'node-fetch';

export type Search = {
  query: string,
  time: Date,
};

const searches: Search[] = [];

/**
 * Return the search results for a request.
 * @param req HTTP request
 * @param res HTTP response
 */
export async function search (req: Request, res: Response) {
  let offset = 0;
  if (typeof (req.query.offset) === 'string') {
    offset = Number (req.query.offset);
  }
  console.log ('search', req.query.q, offset);
  const result = [];
  // get and validate params, generating error result if invalid
  const { q } = req.query;
  if (Number.isNaN (offset) || (offset < 0) || (offset > 100)) {
    res.status (200).json ({ errorCode: 1, message: 'Invalid offset value' });
    return;
  }
  if (!q || typeof (q) !== 'string') {
    res.status (200).json ({ errorCode: 2, message: 'Missing search terms' });
    return;
  }
  if (!process.env.GSKEY) {
    res.status (200).json ({ errorCode: 3, message: 'Missing env variable (GSKEY)' });
    return;
  }
  if (!process.env.GSCX) {
    res.status (200).json ({ errorCode: 3, message: 'Missing env variable (GSCX)' });
    return;
  }

  // image query
  const base = 'https://www.googleapis.com/customsearch/v1?';
  const key = process.env.GSKEY;
  const cx = process.env.GSCX;
  const params = `searchType=image&imgType=photo${(offset) ? `&start=${offset}` : ''}`;
  const url = `${base}key=${key}&cx=${cx}&${params}&q=${encodeURIComponent (q)}`;
  const r = await fetch (url);
  if (!r.ok) {
    res.status (200).json ({
      errorCode: 4,
      message: 'Could not complete request',
    });
  } else {
    type Body = {
      items: [{
        image: {
          thumbnailLink: string,
          contextLink: string,
        },
        link: string,
        snippet: string,
      }],
    };
    const body = await r.json () as Body;
    for (const item of body.items) {
      result.push ({
        thumbnailURL: item.image.thumbnailLink,
        imageURL: item.link,
        description: item.snippet,
        page: item.image.contextLink,
      });
    }

    // keep latest search array at 10 or less items
    if (searches.length > 9) {
      searches.splice (0, searches.length - 9);
    }
    searches.push ({
      query: q,
      time: new Date (),
    });

    res.status (200).json (result);
  }
}

/**
 * Return the list of recent searches
 * @param req HTTP request
 * @param res HTTP response
 */
export function latest (req: Request, res: Response) {
  res.status (200).json (searches);
}
