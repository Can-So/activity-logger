const { assert } = require('chai');
const utils = require('../../src/utils');
const { PROD_SERVER } = require('../../src/constants');
const txHash = '0x552c6ae563e0bafbb9ce2d7bcda0514bb2723e5f9d0bc68558b73a994c1aa80b';
const multiHash = 'QmRA7dWfBvGJBdAp1qacYAt3DdTh9hT4cx3PafLVFauSft';
const id = '11112222';

const apiUrl = PROD_SERVER;

describe('/getTransaction GET', () => {
  it('get the receipt for a given transaction', async () => {
    const res = await utils.sendRequest(apiUrl, `getTransaction/${txHash}`);

    const { transactionReceipt } = res.body;
    const log = transactionReceipt.logs[0];

    assert.strictEqual(200, res.statusCode);
    assert.strictEqual(log.event, 'LogActivity', 'event incorrect!');
    assert.strictEqual(log.args.id, id, 'id incorrect!');
    assert.strictEqual(log.args.multiHash, multiHash, 'id incorrect!');
  });
});