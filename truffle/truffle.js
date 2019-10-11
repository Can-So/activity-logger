module.exports = {
  networks: {
    // Default, should be interfaced with testrpc for test suite to pass
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 6.7e6,
	    gasPrice: 1e9
    },

    // Docker ip when on the same machine!
    docker: {
      host: '172.28.1.4',
      port: 8545,
      network_id: '*',
      gas: 6.7e6,
    },

    ropsten: {
      host: '40.71.88.86', // Current static ip
      port: 9919,
      network_id: '*',
      gas: 6.7e6,
      gasPrice: 10e9 // define as quite high as want rapid tx speed 10-100e9
    },
  },
};
