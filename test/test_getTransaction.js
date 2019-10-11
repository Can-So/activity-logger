const { assert } = require('chai');
const app = require('../src/server');
const utils = require('../src/utils');
const { SERVER_PORT, ASSET_STATES } = require('../src/constants');
const { initContracts, getWeb3Connection } = require('../src/web3');
const { sendTransaction } = require('../src/utils');

describe('/getTransaction GET', () => {
  before(async () => {
    server = app.listen(SERVER_PORT, () => {});

    id = '11112222';
    multiHash = 'QmP2iqTPKtuSsbHKNmdpt3yzoaT6VkovMXR3qh2gn7oUjL';
    metadata = 'metadata';

    // Get a live txHash
    const web3 = getWeb3Connection();
    const { activityLogger } = await initContracts(web3);
    txHash = await sendTransaction(web3, activityLogger, 'logActivity', { id, multiHash, metadata }, web3.eth.accounts[0]);
  });

  after(() => {
    server.close();
  });

  it('should get the receipt for a given transaction hash', async () => {
    const res = await utils.sendRequest(apiUrl, `getTransaction/${txHash}`);

    const { transactionReceipt } = res.body;
    const log = transactionReceipt.logs[0];

    assert.strictEqual(200, res.statusCode);
    assert.strictEqual(log.event, 'LogActivity', 'event incorrect!');
    assert.strictEqual(log.args.id, id, 'id incorrect!');
    assert.strictEqual(log.args.multiHash, multiHash, 'id incorrect!');
  });

  it('should return a 400 if no transaction hash passed', async () => {
    const res = await utils.sendRequest(apiUrl, `getTransaction/`);
    assert.strictEqual(400, res.statusCode);
    assert(res.error.message.includes('Empty transaction hash passed in'), 'error message incorrect!');
  });

  it('should return a 400 when sending an invalid transaction hash', async () => {
    const res = await utils.sendRequest(apiUrl, `getTransaction/12345`);
    assert.strictEqual(400, res.statusCode);
    assert(res.error.message.includes('Malformed transaction hash passed in'), 'error message incorrect!');
  });

  it('should return a 400 when sending an invalid transaction hash - incorrect prefix', async () => {
    const res = await utils.sendRequest(apiUrl, `getTransaction/00ecf0b5632c2ffce2ef665e640a286e751949ced4a8614f46b18e225164ffadam`);
    assert.strictEqual(400, res.statusCode);
    assert(res.error.message.includes('Malformed transaction hash passed in'), 'error message incorrect!');
  });

  it('should return a 400 when sending an invalid transaction hash - incorrect length', async () => {
    const res = await utils.sendRequest(apiUrl, `getTransaction/0xadam`);
    assert.strictEqual(400, res.statusCode);
    assert(res.error.message.includes('Malformed transaction hash passed in'), 'error message incorrect!');
  });

  it('should return a 404 when unable to locate the transaction hash', async () => {
    const res = await utils.sendRequest(apiUrl, `getTransaction/0xecf0b5632c2ffce2ef665e640a286e751949ced4a8614f46b18e225164ffadam`);
    assert.strictEqual(404, res.statusCode);
    assert(res.error.message.includes('The transaction can not be found'), 'error message incorrect!');
  });

  // Ganache is too quick...  
  it.skip('should return a 206, partially found, when the transaction has not been mined yet', async () => {
    const res = await utils.sendRequest(apiUrl, `getTransaction/${txHash}`);
    assert.strictEqual(206, res.statusCode);
    assert(res.error.message.includes('Transaction was found but it has not been included in a block'), 'error message incorrect!');
  });
});