/**
 * Copyright (c) Joe McIntyre, 2016
 * license: MIT (https://github.com/fcc-joemcintyre/imagesearch/LICENSE.txt)
 */
"use strict";
const request = require ("request");

let hostName = "";
let searches = [];

/**
 * Init with hostname and port for host address
 */
function init (protocol, host, port, paas) {
  hostName = `${protocol}://${host}`;
  if ((paas === false) && (port !== 80)) {
    hostName += `:${port}`;
  }
}

/**
 * Return homepage with service usage instructions.
 */
function homepage (req, res) {
  let html =
    `<h1>Image Search Service</h1>
    <p>This service returns a JSON object containing a directory of search results
    for URL that are related to the search terms provided. An offset into the
    results can be provided to allow progression through the results. The service
    also provides an API to retrieve the latest search queries.</p>

    <p>The API format for the search function is</p>
    <pre>    ${hostName}/api/imagesearch?q=[query]&offset=[offset]</pre>

    <p>where [query] holds the search terms, and [offset] is the index of the
    results to start at (if offset is not specified, then it defaults to zero).</p>

    <p>For example, using the following service call,</p>
    <a href="${hostName}/api/imagesearch?q=sunset">
    ${hostName}/api/imagesearch?q=sunset
    </a>
    <p>The result is a JSON message, status 200, with the format</p>
    <pre>
    [
      {
        "thumbnailURL": "http://www.sunsets.com/hawaii/honolulu/thumb1234.jpg",
        "imageURL": "http://www.sunsets.com/hawaii/honolulu/1234.jpg",
        "description": "August sunset at Waikiki Beach",
        "page": "http://www.sunsets.com/hawaii.html"
      },
      {
        ...
      }
    ]
    </pre>

    <p>To get the list of recent searches, use</p>
    <a href="${hostName}/api/imagesearch/latest">
    ${hostName}/api/imagesearch/latest
    </a>

    <p>The result is a JSON message, status 200, with the format</p>
    <pre>
    [
      {
        "query": "sunset",
        "time": "2016-02-27T10:11:12.123Z"
      },
      {
        "query": "sunrise",
        "time": "2016-02-27T08:09:10.012Z"
      },
      {
        ...
      }
    ]
    </pre>`;
  res.status (200).send (html);
}

/**
 * Parse a string to an integer, returning NaN if not an integer
 * @param {String} value String to convert
 * @returns {Number} Converted number, or NaN
 */
function getInteger (value) {
  let result = null;
  if (/^(\-|\+)?([0-9])+$/.test (value)) {
    result = Number (value);
  }
  return result;
}

/**
 * Return the search results for a request.
 */
function search (req, res) {
  let result = [];
  // get and validate params, generating error result if invalid
  let q = req.query.q;
  let offset = req.query.offset;
  if (offset) {
    offset = getInteger (req.query.offset);
    if ((offset === null) || (offset < 0) || (offset > 100)) {
      return res.status (200).json ({ errorCode: 1, message: "Invalid offset value"});
    }
  }
  if (q === undefined) {
    return res.status (200).json ({ errorCode: 2, message: "Missing search terms" });
  }
  if (process.env.GSKEY === undefined) {
    return res.status (200).json ({ errorCode: 3, message: "Missing env variable (GSKEY)" });
  }
  if (process.env.GSCX === undefined) {
    return res.status (200).json ({ errorCode: 3, message: "Missing env variable (GSCX)" });
  }

  // image query
  let base = "https://www.googleapis.com/customsearch/v1?";
  let key = process.env.GSKEY;
  let cx = process.env.GSCX;
  let params = "searchType=image&imgType=photo" + ((offset) ? `&start=${offset}` : "");
  let url = `${base}key=${key}&cx=${cx}&${params}&q=${encodeURIComponent (q)}`;
  request.get (url, function (err, res2, body) {
    if (err) {
      return res.status (200).json ({
        errorCode: 4,
        message: "Could not complete request: " + err
      });
    }
    if (res2.statusCode === 200) {
      body = JSON.parse (body);
      for (let item of body.items) {
        result.push ({
          thumbnailURL: item.image.thumbnailLink,
          imageURL: item.link,
          description: item.snippet,
          page: item.image.contextLink
        });
      }

      // keep latest search array at 10 or less items
      if (searches.length > 9) {
        searches.splice (0, searches.length - 9);
      }
      searches.push ({
        query: q,
        time: new Date ()
      });
    }
    res.status (200).json (result);
  });
}

/**
 * Return the list of recent searches
 */
function latest (req, res) {
  res.status (200).json (searches);
}

exports.init = init;
exports.homepage = homepage;
exports.search = search;
exports.latest = latest;
