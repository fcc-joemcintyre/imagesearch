/**
  @typedef {object} CommandResult
  @property {number} code Error code (0 if no error)
  @property {boolean} exit Flag, exit or not
  @property {number} port Port number
  @property {string} protocol Protocol (http or https)
  @property {string} host Host name
 */

/**
 * Parse a string to an integer, returning null if not an integer
 * @param {string} value String to convert
 * @returns {number?} Converted number, or null
 */
function getInteger (value) {
  const result = Number (value);
  return Number.isInteger (result) ? result : null;
}

/**
 * Valid command options
 *  [--protocol] protocol (http or https), default http
 *  [--host] host name, default localhost
 *  [-p | --port] port to listen on, default 3000
 * @param {string[]} args Array of arguments
 * @returns {CommandResult} Command parsing result
 */
export function processCommand (args) {
  let showHelp = false;
  const errors = [];
  const result = {
    code: 0,
    exit: false,
    protocol: '',
    host: '',
    port: 0,
  };

  let argPort = '';
  for (const arg of args) {
    // if a settings argument, it will contain an equals sign
    if (arg.indexOf ('=') > -1) {
      // divide argument into left and right sides, and assign
      const elements = arg.split ('=');
      const key = elements[0];
      if (key === '--host') {
        result.host = elements[1];
      } else if (key === '--protocol') {
        result.protocol = elements[1];
      } else if ((key === '-p') || (key === '--port')) {
        argPort = elements[1];
      } else {
        errors.push (`Error: Invalid option (${elements[0]})`);
      }
    } else {
      if (arg === '-h' || arg === '--help') {
        showHelp = true;
      } else {
        errors.push (`Error: Invalid option (${arg})`);
      }
    }
  }

  // validate arguments, assign defaults
  if (result.protocol === '') {
    result.protocol = 'http';
  } else if ((result.protocol !== 'http') && (result.protocol !== 'https')) {
    errors.push (`Invalid protocol (${result.protocol}). Must be http or https`);
  }
  if (result.host === '') {
    result.host = 'localhost';
  }
  const port = getInteger (argPort);
  if ((port === null) || (port < 0) || (port > 65535)) {
    errors.push (`Invalid port number (${result.port}). Must be integer between 0 and 65535`);
  } else if (port === 0) {
    result.port = 3000;
  } else {
    result.port = port;
  }

  // if help not an argument, output list of errors
  if ((showHelp === false) && (errors.length > 0)) {
    for (const error of errors) {
      console.log (error);
    }
  }

  // if help argument or errors, output usage message
  if ((showHelp === true) || (errors.length > 0)) {
    console.log (
      `Usage: node lib/main.js [--protocol=http|https][--host=hostname][-p=port][-e=port] [-h]
  --protocol        Protocol to use (http or https). Default: http
  --host            Host name to use. Default: localhost
  -p or --port      Port number to listen on. Default: 3000
  -h or --help      This message.`
    );
    result.code = (showHelp) ? 0 : 1;
    result.exit = true;
  }
  return result;
}
