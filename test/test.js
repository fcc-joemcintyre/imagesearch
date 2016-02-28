/**
 * Copyright (c) Joe McIntyre, 2016
 * license: MIT (https://github.com/fcc-joemcintyre/imagesearch/LICENSE.txt)
 */
"use strict";
const assert = require ("assert");
const request = require ("request");
const processCommand = require ("../lib/cmd").processCommand;
const server = require ("../lib/server");

before (function () {
  server.start ("http", "localhost", 3000, false);
});

describe ("test server", function () {
  describe ("/", function () {
    it ("should return 200 with instructions", function (done) {
      request.get ("http://localhost:3000/", function (err, res, body) {
        if (err) { return done (err); }
        if (res.statusCode === 200) {
          if (body.startsWith ("<h1>Image Search Service</h1>")) {
            return done ();
          }
        }
        return done (new Error ("Invalid response"));
      });
    });
  });

  describe ("invalid URL content", function () {
    it ("should return 200 with instructions", function (done) {
      request.get ("http://localhost:3000/dummy", function (err, res, body) {
        if (err) { return done (err); }
        if (res.statusCode === 200) {
          if (body.startsWith ("<h1>Image Search Service</h1>")) {
            return done ();
          }
        }
        return done (new Error ("Invalid response"));
      });
    });
  });

  describe ("valid request (empty latest searches)", function () {
    it ("should return JSON object with the empty latest searches", function (done) {
      request.get ("http://localhost:3000/api/imagesearch/latest", function (err, res, body) {
        if (err) { return done (err); }
        if (res.statusCode === 200) {
          body = JSON.parse (body);
          if (body.length === 0) {
            return done ();
          } else {
            return done (new Error ("Invalid response values"));
          }
        }
        return done (new Error (`Invalid status code ${res.statusCode}`));
      });
    });
  });

  describe ("valid search", function () {
    it ("should return 200 with search results", function (done) {
      request.get ("http://localhost:3000/api/imagesearch?q=sunset", function (err, res, body) {
        if (err) { return done (err); }
        if (res.statusCode === 200) {
          body = JSON.parse (body);
          if (body.length > 0) {
            return done ();
          }
        }
        return done (new Error ("Invalid response"));
      });
    });
  });

  describe ("valid request (one result in latest searches)", function () {
    it ("should return JSON object with one result in latest searches", function (done) {
      request.get ("http://localhost:3000/api/imagesearch/latest", function (err, res, body) {
        if (err) { return done (err); }
        if (res.statusCode === 200) {
          body = JSON.parse (body);
          if ((body.length === 1) && (body[0].query === "sunset") && (body[0].time)) {
            return done ();
          } else {
            return done (new Error ("Invalid response values", body));
          }
        }
        return done (new Error (`Invalid status code ${res.statusCode}`));
      });
    });
  });

  describe ("invalid param (offset not integer)", function () {
    it ("should return 200 with errorCode 1", function (done) {
      request.get ("http://localhost:3000/api/imagesearch?q=sunsets&offset=abc", function (err, res, body) {
        if (err) { return done (err); }
        if (res.statusCode === 200) {
          body = JSON.parse (body);
          if (body.errorCode === 1) {
            return done ();
          } else {
            return done (new Error ("Not errorCode 1"));
          }
        }
        return done (new Error ("Invalid response"));
      });
    });
  });

  describe ("invalid param (offset negative)", function () {
    it ("should return 200 with errorCode 1", function (done) {
      request.get ("http://localhost:3000/api/imagesearch?q=sunsets&offset=-1", function (err, res, body) {
        if (err) { return done (err); }
        if (res.statusCode === 200) {
          body = JSON.parse (body);
          if (body.errorCode === 1) {
            return done ();
          } else {
            return done (new Error ("Not errorCode 1"));
          }
        }
        return done (new Error ("Invalid response"));
      });
    });
  });

  describe ("invalid param (offset too large)", function () {
    it ("should return 200 with errorCode 1", function (done) {
      request.get ("http://localhost:3000/api/imagesearch?q=sunsets&offset=-1000", function (err, res, body) {
        if (err) { return done (err); }
        if (res.statusCode === 200) {
          body = JSON.parse (body);
          if (body.errorCode === 1) {
            return done ();
          } else {
            return done (new Error ("Not errorCode 1"));
          }
        }
        return done (new Error ("Invalid response"));
      });
    });
  });

  describe ("invalid param (missing query)", function () {
    it ("should return 200 with errorCode 2", function (done) {
      request.get ("http://localhost:3000/api/imagesearch", function (err, res, body) {
        if (err) { return done (err); }
        if (res.statusCode === 200) {
          body = JSON.parse (body);
          if (body.errorCode === 2) {
            return done ();
          } else {
            return done (new Error ("Not errorCode 2"));
          }
        }
        return done (new Error ("Invalid response"));
      });
    });
  });
});

describe ("cmd", function () {
  describe ("empty command", function () {
    it ("should not fail", function () {
      let cmd = processCommand ([]);
      assert.deepStrictEqual (cmd, {code:0, exit:false, protocol:"http", host:"localhost", port:3000, paas:false });
    });
  });

  describe ("invalid standalone option", function () {
    it ("should fail with code 1", function () {
      let cmd = processCommand (["-j"]);
      assert.deepStrictEqual (cmd, {code:1, exit:true, protocol:"http", host:"localhost", port:3000, paas:false });
    });
  });

  describe ("invalid settings option", function () {
    it ("should fail with code 1", function () {
      let cmd = processCommand (["-j=foo.js"]);
      assert.deepStrictEqual (cmd, {code:1, exit:true, protocol:"http", host:"localhost", port:3000, paas:false });
    });
  });

  describe ("proper protocol argument (http)", function () {
    it ("should succeed", function () {
      let cmd = processCommand (["--protocol=http"]);
      assert.deepStrictEqual (cmd, {code:0, exit:false, protocol:"http", host:"localhost", port:3000, paas:false });
    });
  });

  describe ("proper protocol argument (https)", function () {
    it ("should succeed", function () {
      let cmd = processCommand (["--protocol=https"]);
      assert.deepStrictEqual (cmd, {code:0, exit:false, protocol:"https", host:"localhost", port:3000, paas:false });
    });
  });

  describe ("invalid protocol (ftp)", function () {
    it ("should fail", function () {
      let cmd = processCommand (["--protocol=ftp"]);
      assert.deepStrictEqual (cmd, {code:1, exit:true, protocol:"ftp", host:"localhost", port:3000, paas:false });
    });
  });

  describe ("proper host argument", function () {
    it ("should succeed", function () {
      let cmd = processCommand (["--host=example.com"]);
      assert.deepStrictEqual (cmd, {code:0, exit:false, protocol:"http", host:"example.com", port:3000, paas:false });
    });
  });

  describe ("proper port argument", function () {
    it ("should succeed", function () {
      let cmd = processCommand (["-p=2000"]);
      assert.deepStrictEqual (cmd, {code:0, exit:false, protocol:"http", host:"localhost", port:2000, paas:false });
    });
  });

  describe ("port out of range (negative)", function () {
    it ("should fail", function () {
      let cmd = processCommand (["-p=-1"]);
      assert.deepStrictEqual (cmd, {code:1, exit:true, protocol:"http", host:"localhost", port:"-1", paas:false });
    });
  });

  describe ("port out of range (positive)", function () {
    it ("should fail", function () {
      let cmd = processCommand (["-p=200000"]);
      assert.deepStrictEqual (cmd, {code:1, exit:true, protocol:"http", host:"localhost", port:"200000", paas:false });
    });
  });

  describe ("port not an integer", function () {
    it ("should fail", function () {
      let cmd = processCommand (["-p=2000.5"]);
      assert.deepStrictEqual (cmd, {code:1, exit:true, protocol:"http", host:"localhost", port:"2000.5", paas:false });
    });
  });

  describe ("port not a number", function () {
    it ("should fail", function () {
      let cmd = processCommand (["-p=ABC"]);
      assert.deepStrictEqual (cmd, {code:1, exit:true, protocol:"http", host:"localhost", port:"ABC", paas:false });
    });
  });

  describe ("paas option", function () {
    it ("should succeed", function () {
      let cmd = processCommand (["--paas"]);
      assert.deepStrictEqual (cmd, {code:0, exit:false, protocol:"http", host:"localhost", port:3000, paas:true });
    });
  });

  describe ("unary help command", function () {
    it ("should succeed", function () {
      let cmd = processCommand (["-h"]);
      assert.deepStrictEqual (cmd, {code:0, exit:true, protocol:"http", host:"localhost", port:3000, paas:false });
      cmd = processCommand (["--help"]);
      assert.deepStrictEqual (cmd, {code:0, exit:true, protocol:"http", host:"localhost", port:3000, paas:false });
    });
  });

  describe ("help in command", function () {
    it ("should succeed", function () {
      let cmd = processCommand (["-p=2000", "-h"]);
      assert.deepStrictEqual (cmd, {code:0, exit:true, protocol:"http", host:"localhost", port:2000, paas:false });
      cmd = processCommand (["-p=2000", "--help"]);
      assert.deepStrictEqual (cmd, {code:0, exit:true, protocol:"http", host:"localhost", port:2000, paas:false });
    });
  });
});
