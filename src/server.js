const corsMiddleware = require('restify-cors-middleware');
const IPFS = require('ipfs-api');
const log = require('./logger.js');
const restify = require('restify');
const { getIP, getMethodAPI } = require('./utils');
const { getWeb3Connection, initContracts, activityLoggerArtifacts } = require('./web3');
const { IPFS_URL, IPFS_PORT } = require('./constants');

const activitiesRouter = require('./routes/activities');
const transactionsRouter = require('./routes/transactions');

// SERVER CONFIG
const server = restify.createServer({
  log, 
  version: '1.0.0', 
  versions: ['1.0.0'], 
  name: 'activity-logging-service',
  accept: ['application/json', 'text/html', 'image/png']
});

server.use(restify.plugins.bodyParser({ mapParams: false }));

const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: ['*'],
});

server.pre(cors.preflight);
server.use(cors.actual);

// log every incoming request
server.pre((req, res, next) => {
  req.log.info(
    { req, module: 'api' }, 
    `New request from ${getIP(req)} on ${getMethodAPI(req)}`
  );
  next();
});

// log every error
server.on('restifyError', (req, res, err, callback) => {
  log.error(
    { module: 'api', err, version: req.headers['accept-version'] }, 
    `Exception from ${getIP(req)} while requesting ${getMethodAPI(req)}`
  );
  return callback();
});

server.getWeb3Connection = getWeb3Connection;
server.initContracts = initContracts;
server.activityLoggerArtifacts = activityLoggerArtifacts;
server.ipfs = new IPFS({ host: IPFS_URL, port: IPFS_PORT, protocol: 'https' });

transactionsRouter.applyRoutes(server);
activitiesRouter.applyRoutes(server);

module.exports = server;
