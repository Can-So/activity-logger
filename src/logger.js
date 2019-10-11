const bunyan = require('bunyan');
const cluster = require('cluster');
const PrettyStream = require('bunyan-prettystream');

const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

let name = 'activity-logging-service';

// If a worker thread append id to name
if (cluster.worker) {
  name = `activity-logging-service-${cluster.worker.id}`;
}

// Init the actual logger
const log = bunyan.createLogger({
  name,
  serializers: bunyan.stdSerializers,
  streams: [
    // ---- If you wish to log to disk ---- //
    // {
    //   path: './server.log',
    //   level: 'debug',
    // },
    {
      stream: prettyStdOut,
      level: 'debug',
    },
  ],
});

log.fields.module = undefined;

module.exports = log;