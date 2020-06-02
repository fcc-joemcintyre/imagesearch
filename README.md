# Image Search Service

[![Build Status](https://travis-ci.org/fcc-joemcintyre/imagesearch.svg?branch=master)](https://travis-ci.org/fcc-joemcintyre/imagesearch)

This service returns a JSON object containing a directory of search results
for URL that are related to the search terms provided. An offset into the
results can be provided to allow progression through the results.

A second capability is provided to retrieve the latest search queries.

The API format for the search function is

    https://[hostname]/api/imagesearch?q=[query]&offset=[offset]

where [hostname] is the host name of the server hosting the service, [query]
holds the search terms, and [offset] is the index of the results to start at
(if offset is not specified, then it defaults to zero).

To get the list of recent searches, use

    https://[hostname]/api/imagesearch/latest

where [hostname] is the host name of the server hosting the service.

An instance of the service is available at

> https://imagesearch-jm.herukoapp.com

For example, using the following service call,

> https://imagesearch-jm.herokuapp.com/api/imagesearch?q=sunset

The result is a JSON message, status 200, with the format

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

For the latest searches, use the following service call,

    > https://imagesearch-jm.herokuapp.com/api/imagesearch/latest

The result is a JSON message, status 200, with the format

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

## License
MIT
