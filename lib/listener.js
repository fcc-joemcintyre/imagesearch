import fetch from 'node-fetch';

const searches = [];

/**
 * Parse a string to an integer, returning null if not an integer
 * @param {String} value String to convert
 * @returns {Number} Converted number, or null
 */
function getInteger (value) {
  const result = Number (value);
  return Number.isInteger (result) ? result : null;
}

/**
 * Return the search results for a request.
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 * @returns {void}
 */
export async function search (req, res) {
  console.log ('search', req.query.q, getInteger (req.query.offset) || 0);
  const result = [];
  // get and validate params, generating error result if invalid
  const q = req.query.q;
  let offset = req.query.offset;
  if (offset) {
    offset = getInteger (req.query.offset);
    if ((offset === null) || (offset < 0) || (offset > 100)) {
      res.status (200).json ({ errorCode: 1, message: 'Invalid offset value' });
      return;
    }
  }
  if (!q) {
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
    const body = await r.json ();
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
 * @param {Object} req HTTP request
 * @param {Object} res HTTP response
 * @returns {void}
 */
export function latest (req, res) {
  res.status (200).json (searches);
}
