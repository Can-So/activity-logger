const errors = require('restify-errors');
const log = require('../logger');
const { Router } = require('restify-router');
const { sendTransaction, pingIpfs, getImageFromUrl } = require('../utils');
const { IPFS_URL, IPFS_PORT, IPFS_PATH_PREFIX, ETH_NETWORK } = require('../constants');

const router = new Router();

/**
 * Add a new activity pushing the file to IPFS and logging activity on-chain.
 * @param {String} req.body.id       ID of the profile associated with the activity.
 * @param {String} req.body.imageUrl Url of the image to be pushed to IPFS, must contain data, buffer.length > 0.
 * @param {String} req.body.metadata Complimentary data.
 */
async function addActivity(req, res, next) {
  try {
    const { id, imageUrl, metadata } = req.body;
    let buffer;

    if (!id || typeof id !== 'string') {
      throw new errors.BadRequestError(`Id must be a valid string the following is invalid: ${id}`);
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new errors.BadRequestError(`imageUrl must be a valid string the following is invalid: ${imageUrl}`);
    }

    log.info({ module: 'activity-logging-service' }, `Retrieving image from ${imageUrl}`);

    try {
      buffer = await getImageFromUrl(imageUrl);
    } catch(err) {
      throw new errors.BadRequestError(`Error while retrieving image: ${err}`);
    }

    if (!buffer.length) {
      throw new errors.BadRequestError(`Invalid image size retrieved of: ${buffer.length} for imageUrl: ${imageUrl}`);
    }

    log.info({ module: 'activity-logging-service' }, `Retrieved image of length ${buffer.length}... pushing to ipfs...`);

    // Confirm connection before pushing to ipfs
    if (!await pingIpfs(this.ipfs)) {
      throw new errors.BadGatewayError(`Can not create a connection to the IPFS node @ ${IPFS_URL}:${IPFS_PORT}`); 
    }

    const ipfsResponse = await this.ipfs.add(buffer); 
    const ipfsHash = ipfsResponse[0].hash;

    log.info({ module: 'activity-logging-service' }, `Image added to ipfs @ ${IPFS_PATH_PREFIX}${ipfsHash}`);

    const web3 = this.getWeb3Connection();
    const { activityLogger } = await this.initContracts(web3);  
    const sender = web3.eth.accounts[0];

    const transactionHash = await sendTransaction(web3, activityLogger, 'logActivity', { id, ipfsHash, metadata }, sender);

    log.info(
        { module: 'activity-logging-service' }, 
        `Successfully sent tx @ https://${ETH_NETWORK}.etherscan.io/tx/${transactionHash}`
      );

    res.send(201, { transactionHash, ipfsHash });
    return next();
  } catch (err) {
    return next(err);
  }
}

router.post({ path: '/addActivity', version: '1.0.0' }, addActivity);

module.exports = router;
