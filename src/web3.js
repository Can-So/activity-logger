const activityLoggerArtifacts = require('../truffle/build/contracts/ActivityLogger.json');
const errors = require('restify-errors');
const Web3 = require('web3');
const { ACTIVITY_LOGGER_ADDR, ETH_RPC_URL, ETH_RPC_PORT } = require('./constants');

module.exports = {
  activityLoggerArtifacts,

  /**
   * Attempt to create a new web3 connection to an Ethereum node or return the existing connection.
   * @return {Object} Web3 connection. 
   */
  getWeb3Connection: () => {
    if (this.web3) {
      return this.web3;
    }
    
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(`${ETH_RPC_URL}:${ETH_RPC_PORT}`));
      if(!web3.isConnected()) {
        throw new Error('web3 is not connected...');
      }
      this.web3 = web3;
      return web3;
    } catch(err) {
      throw new errors.BadGatewayError(`Unable to create a connection to the ETH Node @ ${ETH_RPC_URL}:${ETH_RPC_PORT}\n${err}`);
    }
  },

  /**
   * Synchronous creation of references to the deployed contracts.
   * Promise required as web3 does not currently support await / async pattern.
   * @param {Object} web3 Web3 connection to Ethereum node.
   * @return {Object}     Reference objects to the deployed contracts
   */
  initContracts: (web3) => {
    if (!web3) {
      throw new Error('Empty web3 passed in.  Please create a web3 connection and pass it in here...');
    }

    return new Promise((resolve, reject) => {
      if (ACTIVITY_LOGGER_ADDR === 0) {
        web3.version.getNetwork(async (err, netId) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              activityLogger: web3.eth.contract(activityLoggerArtifacts.abi).at(activityLoggerArtifacts.networks[netId].address),
            });
          }
        });
      } else {
        resolve({
          activityLogger: web3.eth.contract(activityLoggerArtifacts.abi).at(ACTIVITY_LOGGER_ADDR),
        });
      }
    });
  },
};