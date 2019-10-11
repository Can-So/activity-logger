module.exports = {
    API_PATH:             process.env.API_PATH             || 'http://localhost',
    ACTIVITY_LOGGER_ADDR: process.env.ACTIVITY_LOGGER_ADDR || 0,
    ETH_NETWORK:          process.env.ETH_NETWORK          || 'ropsten',
    ETH_RPC_URL:          process.env.ETH_RPC_URL          || 'http://localhost',
    ETH_RPC_PORT:         process.env.ETH_RPC_PORT         || 8545,
    GAS_BUFFER:           process.env.GAS_BUFFER           || 5e5,
    IPFS_URL:             process.env.IPFS_URL             || 'ipfs.infura.io',
    IPFS_PORT:            process.env.IPFS_PORT            || 5001,
    IPFS_PATH_PREFIX:     process.env.IPFS_PORT            || 'https://gateway.ipfs.io/ipfs/',
    PROD_SERVER:          process.env.PROD_SERVER          || 'http://40.86.203.135:3033',
    SERVER_PORT:          process.env.SERVER_PORT          || 3001,
    THREADS:              process.env.THREADS              || 1,
}