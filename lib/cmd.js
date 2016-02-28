/**
 * Copyright (c) Joe McIntyre, 2016
 * license: MIT (https://github.com/fcc-joemcintyre/imagesearch/LICENSE.txt)
 */
"use strict";

/**
 * Parse a string to an integer, returning null if not an integer
 * @param {String} value String to convert
 * @returns {Number} Converted number, or null
 */
function getInteger (value) {
  let result = null;
  if (/^(\-|\+)?([0-9])+$/.test (value)) {
    result = Number (value);
  }
  return result;
}

/**
 * Valid command options
 *  [--protocol] protocol (http or https), default http
 *  [--host] host name, default localhost
 *  [-p | --port] port to listen on, default 3000
 *  [--paas] if PaaS, don't use port externally, default false
 * @param {[String]} Array of arguments
 * @returns {Object} code:{Integer}, exit:{Boolean}, protocol:{String},
                     host:{String}, port:{Integer}, pass:{Boolean}
 */
function processCommand (args) {
  let showHelp = false;
  let errors = [];
  let result = {
    code: 0,
    exit: false,
    protocol: "",
    host: "",
    port: 0,
    paas: false
  };

  for (let arg of args) {
    // if a settings argument, it will contain an equals sign
    if (arg.indexOf ("=") > -1) {
      // divide argument into left and right sides, and assign
      let elements = arg.split ("=");
      let key = elements[0];
      if (key === "--host") {
        result.host = elements[1];
      } else if (key === "--protocol") {
        result.protocol = elements[1];
      } else if ((key === "-p") || (key === "--port")) {
        result.port = elements[1];
      } else{
        errors.push (`Error: Invalid option (${elements[0]})`);
      }
    } else {
      if (arg === "-h" || arg === "--help") {
        showHelp = true;
      } else if (arg === "--paas") {
        result.paas = true;
      } else {
        errors.push (`Error: Invalid option (${arg})`);
      }
    }
  }

  // validate arguments, assign defaults
  if (result.protocol === "") {
    result.protocol = "http";
  } else if ((result.protocol !== "http") && (result.protocol !== "https")) {
    errors.push (`Invalid protocol (${result.protocol}). Must be http or https`);
  }
  if (result.host === "") {
    result.host = "localhost";
  }
  let port = getInteger (result.port);
  if ((port === null) || (port < 0) || (port > 65535)) {
    errors.push ("Invalid port number (${result.port}). Must be integer between 0 and 65535");
  } else if (port === 0) {
    result.port = 3000;
  } else {
    result.port = port;
  }

  // if help not an argument, output list of errors
  if ((showHelp === false) && (errors.length > 0)) {
    for (let error of errors) {
      console.log (error);
    }
  }

  // if help argument or errors, output usage message
  if ((showHelp === true) || (errors.length > 0)) {
    console.log (
`Usage: imagesearch [--protocol=http|https][--host=hostname][-p=port][-e=port] [-h]
  --protocol        Protocol to use (http or https). Default: http
  --host            Host name to use. Default: localhost
  -p or --port      Port number to listen on. Default: 3000
  --paas            PaaS (do not externalize port)
  -h or --help      This message.`);
    result.code = (showHelp) ? 0 : 1;
    result.exit = true;
  }
  return result;
}

exports.processCommand = processCommand;
