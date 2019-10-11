const errors = require('restify-errors');
const log = require('../logger');
const { Router } = require('restify-router');
const { parseEventLogsFromReceipt, waitForTransaction } = require('../utils');
const { ETH_NETWORK } = require('../constants'); 

const router = new Router();

/**
 * Try to retrieve a given transaction's receipt.  If transaction has been mined will return the receipt.
 * @param {String} req.params.transactionHash The transaction hash of a previously created transaction.
 */
async function getTransaction(req, res, next) {
  try {
    const { transactionHash } = req.params;

    // Null tx hash
    if (!transactionHash) {
      throw new errors.BadRequestError(
        'Empty transaction hash passed in... it should look something like this: 0xecf0b5632c2ffce2ef665e640a286e751949ced4a8614f46b18e225164ffcc8f'
      );
    }

    // Malformed tx hash, begin with hex prefix and be 32 bytes long, 32 bytes = 64 hex + 0x = 66 characters
    if (transactionHash.slice(0,2) !== '0x' || transactionHash.length !== 66) {
      throw new errors.BadRequestError(
        `Malformed transaction hash passed in... it should look something like this: 0xecf0b5632c2ffce2ef665e640a286e751949ced4a8614f46b18e225164ffcc8f\n
        The transaction hash MUST be prefixed with 0x and be 66 total characters long, including the 0x.\n
        The following was sent: ${transactionHash}`
      );
    }

    const web3 = this.getWeb3Connection();
    const transactionReceipt = web3.eth.getTransactionReceipt(transactionHash);

    if (!transactionReceipt) {
      throw new errors.NotFoundError(
        `The transaction can not be found! Please ensure it is in the correct format including the 0x prefix.\n
         Here's what we got: ${transactionHash}`
        );
    } else if (!transactionReceipt.blockNumber) {
      res.send(206, `Transaction was found but it has not been included in a block yet... please try again soon... ${transactionHash}`);
    } else {
      transactionReceipt['logs'] = await parseEventLogsFromReceipt(transactionReceipt, this.activityLoggerArtifacts.abi);

      log.info(
        { module: 'activity-logging-service' }, 
        `Successfully retrieved tx @ https://${ETH_NETWORK}.etherscan.io/tx/${transactionHash}`
      );

      res.send(200, { transactionReceipt });
    }
    
    return next();
  } catch (err) {
    return next(err);
  }
}

router.get({ path: '/getTransaction/:transactionHash/', version: '1.0.0' }, getTransaction);

module.exports = router;
