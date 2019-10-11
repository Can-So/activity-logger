const { assert } = require('chai');
const app = require('../src/server');
const { sendRequest } = require('../src/utils');
const { SERVER_PORT } = require('../src/constants');

describe('/addActivity POST', () => {
  before(async () => {
    server = app.listen(SERVER_PORT, () => {});

    body = {
      id: '11112222',
      imageUrl: 'https://response.restoration.noaa.gov/sites/default/files/images/13/cleanup-workers-shoveling-oil-into-bag-sandy-beach-refugio_coast-guard_980.jpg',
      metadata: 'some metadata'
    };
  });

  after(() => {
    server.close();
  });

  describe('When sending a valid request', () => {
    it('should add a new activity returning the transaction and ipfs hashes', async () => {
      const res = await sendRequest(apiUrl, `addActivity`, 'POST', body);

      const { transactionHash, ipfsHash } = res.body;

      assert.strictEqual(201, res.statusCode);
      assert.strictEqual(transactionHash.length, 66, 'transaction hash invalid!');
      assert.strictEqual(ipfsHash.slice(0, 2), 'Qm', 'ipfsHash incorrect!');
    });

    it('Image #2 should add a new activity returning the transaction and ipfs hashes', async () => {
      const reqBody = {
        id: body.id,
        imageUrl: 'https://media.licdn.com/dms/image/C4E0BAQG41dZYAK74hg/company-logo_200_200/0?e=2159024400&v=beta&t=_yBE8EcxXsSeYQVmXE89-SSJ3-E94ewkp2G_Q0pIs_8',
        metadata: 'metadata',
      };
      
      const res = await sendRequest(apiUrl, `addActivity`, 'POST', reqBody);

      const { transactionHash, ipfsHash } = res.body;

      assert.strictEqual(201, res.statusCode);
      assert.strictEqual(transactionHash.length, 66, 'transaction hash invalid!');
      assert.strictEqual(ipfsHash.slice(0, 2), 'Qm', 'ipfsHash incorrect!');
    });
  });

  describe('When sending an empty id', () => {
    it('should raise an error returning a 400', async () => {
      const body2 = {
        id: '',
        imageUrl: 'file',
        metadata: 'metadata',
      };

      const res = await sendRequest(apiUrl, `addActivity`, 'POST', body2);
      assert.strictEqual(400, res.statusCode);
      assert.strictEqual('Id must be a valid string the following is invalid: ', res.error.message, 'Error message incorrect');
    });
  });

  describe('When sending no id', () => {
    it('should raise an error returning a 400', async () => {
      const body2 = {
        imageUrl: 'file',
        metadata: 'metadata',
      };

      const res = await sendRequest(apiUrl, `addActivity`, 'POST', body2);
      assert.strictEqual(400, res.statusCode);
      assert.strictEqual('Id must be a valid string the following is invalid: undefined', res.error.message, 'Error message incorrect');
    });
  });

  describe('When sending no imageUrl', () => {
    it('should raise an error returning a 400', async () => {
      const body2 = {
        id: '123',
        metadata: 'metadata',
      };

      const res = await sendRequest(apiUrl, `addActivity`, 'POST', body2);
      assert.strictEqual(400, res.statusCode, 'Statuscode incorrect.');
      assert.strictEqual('imageUrl must be a valid string the following is invalid: undefined', res.error.message, 'Error message incorrect');
    });
  });

  describe('When sending an invalid url', () => {
    it('should raise an error returning a 400', async () => {
      const body2 = {
        id: '123',
        imageUrl: 'invalid',
        metadata: 'metadata',
      };

      const res = await sendRequest(apiUrl, `addActivity`, 'POST', body2);

      assert.strictEqual(400, res.statusCode);
      assert.strictEqual('Error while retrieving image: Error: Invalid URI "invalid"', res.error.message, 'Error message incorrect');
    });
  });
});