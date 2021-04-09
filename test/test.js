import assert from 'assert';
import fetch from 'node-fetch';
import { processCommand } from '../lib/cmd.js';
import { start, stop } from '../lib/server.js';

before (async function () {
  await start ('http', 'localhost', 3000);
});

after (async function () {
  await stop ();
});

describe ('test server', function () {
  describe ('/', function () {
    it ('should return 200 with home page', async function () {
      const res = await fetch ('http://localhost:3000/');
      assert (res.status === 200);
      const body = await res.text ();
      assert (body.startsWith ('<h1>Image Search Service</h1>'));
    });
  });

  describe ('invalid URL content', function () {
    it ('should return 200 with home page', async function () {
      const res = await fetch ('http://localhost:3000/dummy');
      assert (res.status === 200);
      const body = await res.text ();
      assert (body.startsWith ('<h1>Image Search Service</h1>'));
    });
  });

  describe ('valid request (empty latest searches)', function () {
    it ('should return JSON object with the empty latest searches', async function () {
      const res = await fetch ('http://localhost:3000/api/imagesearch/latest');
      assert (res.status === 200);
      const body = await res.json ();
      assert (body.length === 0);
    });
  });

  describe ('valid search', function () {
    it ('should return 200 with search results', async function () {
      const res = await fetch ('http://localhost:3000/api/imagesearch?q=sunset');
      assert (res.status === 200);
      const body = await res.json ();
      assert (body.length > 0);
    }).timeout (5000);
  });

  describe ('valid request (one result in latest searches)', function () {
    it ('should return JSON object with one result in latest searches', async function () {
      const res = await fetch ('http://localhost:3000/api/imagesearch/latest');
      assert (res.status === 200);
      const body = await res.json ();
      assert ((body.length === 1) && (body[0].query === 'sunset') && (body[0].time));
    });
  });

  describe ('invalid param (offset not integer)', function () {
    it ('should return 200 with errorCode 1', async function () {
      const res = await fetch ('http://localhost:3000/api/imagesearch?q=sunsets&offset=abc');
      assert (res.status === 200);
      const body = await res.json ();
      assert (body.errorCode === 1);
    });
  });

  describe ('invalid param (offset negative)', function () {
    it ('should return 200 with errorCode 1', async function () {
      const res = await fetch ('http://localhost:3000/api/imagesearch?q=sunsets&offset=-1');
      assert (res.status === 200);
      const body = await res.json ();
      assert (body.errorCode === 1);
    });
  });

  describe ('invalid param (offset too large)', function () {
    it ('should return 200 with errorCode 1', async function () {
      const res = await fetch ('http://localhost:3000/api/imagesearch?q=sunsets&offset=-1000');
      assert (res.status === 200);
      const body = await res.json ();
      assert (body.errorCode === 1);
    });
  });

  describe ('invalid param (missing query)', function () {
    it ('should return 200 with errorCode 2', async function () {
      const res = await fetch ('http://localhost:3000/api/imagesearch');
      assert (res.status === 200);
      const body = await res.json ();
      assert (body.errorCode === 2);
    });
  });
});

describe ('cmd', function () {
  describe ('empty command', function () {
    it ('should not fail', function () {
      const cmd = processCommand ([]);
      assert.deepStrictEqual (cmd, { code: 0, exit: false, protocol: 'http', host: 'localhost', port: 3000 });
    });
  });

  describe ('invalid standalone option', function () {
    it ('should fail with code 1', function () {
      const cmd = processCommand (['-j']);
      assert.deepStrictEqual (cmd, { code: 1, exit: true, protocol: 'http', host: 'localhost', port: 3000 });
    });
  });

  describe ('invalid settings option', function () {
    it ('should fail with code 1', function () {
      const cmd = processCommand (['-j=foo.js']);
      assert.deepStrictEqual (cmd, { code: 1, exit: true, protocol: 'http', host: 'localhost', port: 3000 });
    });
  });

  describe ('proper protocol argument (http)', function () {
    it ('should succeed', function () {
      const cmd = processCommand (['--protocol=http']);
      assert.deepStrictEqual (cmd, { code: 0, exit: false, protocol: 'http', host: 'localhost', port: 3000 });
    });
  });

  describe ('proper protocol argument (https)', function () {
    it ('should succeed', function () {
      const cmd = processCommand (['--protocol=https']);
      assert.deepStrictEqual (cmd, { code: 0, exit: false, protocol: 'https', host: 'localhost', port: 3000 });
    });
  });

  describe ('invalid protocol (ftp)', function () {
    it ('should fail', function () {
      const cmd = processCommand (['--protocol=ftp']);
      assert.deepStrictEqual (cmd, { code: 1, exit: true, protocol: 'ftp', host: 'localhost', port: 3000 });
    });
  });

  describe ('proper host argument', function () {
    it ('should succeed', function () {
      const cmd = processCommand (['--host=example.com']);
      assert.deepStrictEqual (cmd, { code: 0, exit: false, protocol: 'http', host: 'example.com', port: 3000 });
    });
  });

  describe ('proper port argument', function () {
    it ('should succeed', function () {
      const cmd = processCommand (['-p=2000']);
      assert.deepStrictEqual (cmd, { code: 0, exit: false, protocol: 'http', host: 'localhost', port: 2000 });
    });
  });

  describe ('port out of range (negative)', function () {
    it ('should fail', function () {
      const cmd = processCommand (['-p=-1']);
      assert.deepStrictEqual (cmd, { code: 1, exit: true, protocol: 'http', host: 'localhost', port: 0 });
    });
  });

  describe ('port out of range (positive)', function () {
    it ('should fail', function () {
      const cmd = processCommand (['-p=200000']);
      assert.deepStrictEqual (cmd, { code: 1, exit: true, protocol: 'http', host: 'localhost', port: 0 });
    });
  });

  describe ('port not an integer', function () {
    it ('should fail', function () {
      const cmd = processCommand (['-p=2000.5']);
      assert.deepStrictEqual (cmd, { code: 1, exit: true, protocol: 'http', host: 'localhost', port: 0 });
    });
  });

  describe ('port not a number', function () {
    it ('should fail', function () {
      const cmd = processCommand (['-p=ABC']);
      assert.deepStrictEqual (cmd, { code: 1, exit: true, protocol: 'http', host: 'localhost', port: 0 });
    });
  });

  describe ('unary help command', function () {
    it ('should succeed', function () {
      let cmd = processCommand (['-h']);
      assert.deepStrictEqual (cmd, { code: 0, exit: true, protocol: 'http', host: 'localhost', port: 3000 });
      cmd = processCommand (['--help']);
      assert.deepStrictEqual (cmd, { code: 0, exit: true, protocol: 'http', host: 'localhost', port: 3000 });
    });
  });

  describe ('help in command', function () {
    it ('should succeed', function () {
      let cmd = processCommand (['-p=2000', '-h']);
      assert.deepStrictEqual (cmd, { code: 0, exit: true, protocol: 'http', host: 'localhost', port: 2000 });
      cmd = processCommand (['-p=2000', '--help']);
      assert.deepStrictEqual (cmd, { code: 0, exit: true, protocol: 'http', host: 'localhost', port: 2000 });
    });
  });
});
