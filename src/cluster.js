const cluster = require('cluster');
const log = require('./logger.js');
const server = require('./server');
const { THREADS, SERVER_PORT } = require('./constants');

// Threads to spawn, default to 1
initServerCluster(THREADS);

/**
 * Initialize the server cluster with specified workers.
 * @param {Integer} threads Number of threads to spawn.
 */
function initServerCluster(threads) {
  if (cluster.isMaster) {
    log.info({ module: 'master' }, `Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < threads; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      log.error({ module: 'master' }, `Worker ${worker.id} @ ${worker.process.pid} died`);
      log.info({ module: 'master' }, 'attempting to revive api worker...');
      setTimeout(() => cluster.fork(), 10000);
    });

    cluster.on('disconnect', (worker) => {
      log.error({ module: 'master' }, `The worker #${worker.id} has disconnected`);
    });
  } else {
    log.info({ module: 'master' }, `Worker ${process.pid} is running`);

    server.listen(SERVER_PORT, () => {
      log.info({ module: 'api' }, `${server.name} listening at ${server.url}`);
    });
  }
}
