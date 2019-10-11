const { GAS_BUFFER } = require('./constants');
const log = require('./logger');
const request = require('request').defaults({ encoding: null });
const rp = require('request-promise');
const SolidityEvent = require('web3/lib/web3/event.js');

/**
 * Return the IP of the caller.
 * @param  {Object} req Contains the parameters needed to figure out caller's IP.
 * @return {String}     The caller's IP.
 */
module.exports = {
  getIP: function(req) {
    return req.headers['x-forwarded-for'] ?
      req.headers['x-forwarded-for'].split(',')[0] :
      req.connection.remoteAddress;
  },

  getImageFromUrl: async function(imageUrl) {
    return new Promise((resolve, reject) => {
      request.get(imageUrl, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res.body);
        }
      });
    });
  },

  /**
   * Returns the type of method and api url being called.
   * @param  {Object} req        Contains the method and url parameters.
   * @param  {String} req.method HTTP request method.
   * @param  {String} req.url    api endpoint.
   * @return {String}            Concatenation of method and url.
   */
  getMethodAPI: function({ method, url }) {
    return `${method} ${url}`;
  },

  /**
   * @param {Object} receipt  The raw on-chain receipt, encoded.
   * @param {Object} abi      Interface of the contract used to decode event logs.
   * @return {Array}          Receipt in human readable form if possible.
   */
  parseEventLogsFromReceipt: async function(receipt, abi) {
    let cleanedLogs = [];
    
    for (let i = 0; i < receipt.logs.length; i += 1) {
      cleanedLogs.push(await parseEventLog(abi, receipt.logs[i]));
    }

    return cleanedLogs;
  },

  /**
   * Return the version of ipfs currently connected in order to detect successful connection.
   * @param {Object} ipfs Connection to an ipfs node.
   * @return {Promise}    Version data output from the node.
   */
  pingIpfs: function(ipfs) {
    return new Promise((resolve, reject) => {
      ipfs.version((err, version) => {
        resolve(version)
      });
    });
  },

  /**
   * Send an http request.
   * @param {String} apiUrl   Location of the api.
   * @param {String} endpoint API endpoint.
   * @param {String} method   Method to hit endpoint with, i.e. GET, POST, PUT, DELETE.
   * @param {Object} body     Body to send with request.
   * @returns {Object}        Response(entire object) or error.
   */
  sendRequest: async function(apiUrl, endpoint, method, body) {
    const options = {
      url: `${apiUrl}/${endpoint}`,
      method,
      json: true,
      resolveWithFullResponse: true,
      body,
      simple: true,
    };
    try {
      return await rp(options);
    } catch (err) {
      return err;
    }
  },

  /**
   * Send an http request with a file.
   * @param {String} apiUrl    Location of the api.
   * @param {String} endpoint  API endpoint.
   * @param {String} method    Method to hit endpoint with, i.e. GET, POST, PUT, DELETE.
   * @param {Object} body      Body to send with request.
   * @param {String}  body.id       Id of assoicated profile.
   * @param {String}  body.metadata Complimentary data.
   * @param {File}    body.file     Raw file object.
   * @returns {Object}         Response(entire object) or error.
   */
  sendRequestWithFile: async function(apiUrl, endpoint, method, body) {
    const { file, id, metadata } = body;

    const options = {
      url: `${apiUrl}/${endpoint}`,
      method: method,
      json: true,
      resolveWithFullResponse: true,
      simple: true,
      formData: {
        id,
        metadata,
        file: {
            value: file,
            options: {
                filename: 'img.jpg',
                contentType: 'img/jpg'
            }
        }
      }
    };

    try {
      return await rp(options);
    } catch (err) {
      return err;
    }
  },

  /**
   * Send an on-chain transaction.
   * @param {Object} web3     web3 connection to live node to send transaction through.
   * @param {Object} contract A contract instance to interact with.
   * @param {String} method   The method of the contract to call.
   * @param {Object} params   The parameters to send to the above method.
   * @param {String} sender   The address of the account to send the transaction.  This account must be unlocked on the given node currently.
   */
  sendTransaction: async function(web3, contract, method, params, sender) {
    const gas = await web3.eth.estimateGas({
      to: contract.address,
      data: contract[method].getData(...Object.values(params)),
    });

    log.info({ module: 'assets' }, `Gas estimation for transaction is ${gas}`);

    const txHash = await contract[method](
      ...Object.values(params),
      {
        from: sender,
        gas: gas + GAS_BUFFER,
      },
    );

    return txHash;
  },
}

// -------- Helpers ------------
/**
 * Parse the logged events into human readable strin
 * @param {Object}  abi  Contract abi event was emitted from.
 * @param {Object}  log  Log of event emission.
 * @returns {Object}     Human readable events
 */
function parseEventLog(abi, log) {
  const decoders = abi.filter((json) => {
      return json.type === 'event';
  }).map((json) => {
      // note first and third params required only by enocde and execute;
      // so don't call those!
      return new SolidityEvent(null, json, null);
  });

  try {
    return decoders.find((decoder) => {
        return (decoder.signature() == log.topics[0].replace('0x',''));
    }).decode(log);
  } catch (err) {
    return log;
  }
}