const { assert } = require('chai');
const request = require('request-promise');

describe('/addActivity POST', () => {
  describe('When sending a valid request', () => {
    it.only('should add a new activity returning the transaction and ipfs hashes', async () => {
      const imageUrl = 'https://response.restoration.noaa.gov/sites/default/files/images/13/cleanup-workers-shoveling-oil-into-bag-sandy-beach-refugio_coast-guard_980.jpg';
      const CHAIN_HOOK_URL = "http://40.86.203.135:3033/addActivity";

      const newBlockAction = {
        id: 'newAction.id',
        imageUrl,
        metadata: JSON.stringify({
          author: 'newAction.author',
          tags: 'newAction.tags',
          desc: 'newAction.desc',
          title: 'newAction.title'
        })
      };
      
      const options = {
        uri: CHAIN_HOOK_URL,
        method: "POST",
        json: true,
        body: newBlockAction,
        simple: true,
        resolveWithFullResponse: true
      };
        
      const sendRequest = options => {
        return new Promise((resolve, reject) =>  {
          request(options)
            .then(response => {
                if (response.statusCode >= 400) {
                    console.error(`HTTP Error: ${response.statusCode}`, response.error.message);
                    reject(response.error.message);
                }
                console.log('statusCode', response.statusCode);
                console.log('body', response.body);
                console.log('error', response.error);
                resolve(response);
            })
            .catch(error => {
                console.error('Error during blockchain action sync:', error.message);
                reject(error);
            });
        });
      };

      const res = await sendRequest(options);

      const { transactionHash, ipfsHash } = res.body;

      assert.strictEqual(201, res.statusCode);
      assert.strictEqual(transactionHash.length, 66, 'transaction hash invalid!');
      assert.strictEqual(ipfsHash.slice(0, 2), 'Qm', 'ipfsHash incorrect!');
    });
  });
});