const ActivityLogger = artifacts.require('./ActivityLogger.sol');

module.exports = (deployer) => {
  deployer.deploy(ActivityLogger);
};
