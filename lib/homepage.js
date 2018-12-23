
function homepage (hostName) {
  return (
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
    </pre>`
  );
}

exports.homepage = homepage;
