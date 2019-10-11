2. Get Transaction
---------------

Will search for the transaction receipt for a given transaction hash.  Critical for user experience so to not leave UI hanging while the transaction
is to be mined.  Note this method will make one query for the transaction and then return.

- URL: ``/getTransaction/:transactionHash``
- Method: ``GET``
- Body: undefined
- Params:
    - transactionHash *[required]*
        - string
        - The transaction hash of a previously sent transaction
        - The string must be hex encoded, only containing hex characters and prefixed with ``0x``, ie. ``0xde3d4ae70d48544d4647c0d3d6d745383d7234e1f210202e7cc8535dc77eea8a``

- Example Request
    
    .. code-block:: JavaScript

        const fs = require('fs');
        const rp = require('request-promise');

        const options = {
            url: `http://localhost:3001/getTransaction/0xecf0b5632c2ffce2ef665e640a286e751949ced4a8614f46b18e225164ffcc8f`,
            method: 'GET',
            json: true,
            resolveWithFullResponse: true,
            simple: true,
        };
        
        sendRequest(options);

        async function sendRequest(options) {
            const response = await rp(options);
            console.log(response.statusCode);
            console.log(response.body);
            console.log(response.error);
        }

- Example Responses
    - Successfully retrieved transaction
        - statusCode: 200
        - body: 

            .. code-block:: JavaScript
                
                { 
                    transactionReceipt: { 
                        transactionHash:   '0x6dc14020faf21fd730562d4497a96664ab5b3434356c3b7c53ae756c3349fd99',
                        transactionIndex:  0,
                        blockHash:         '0xc4862feb905c456d8e1919c6d5355caf7865a5a920aa9426ca6421db01568046',
                        blockNumber:       5,
                        from:              '0x6336cd2db73faa4d7ec3d5d4a5ef0761159550cd',
                        to:                '0xe8126708fb2d2e62ffe8b100dcee1e0d614a717b',
                        gasUsed:           28989,
                        cumulativeGasUsed: 28989,
                        contractAddress:   null,
                        logs: [{ 
                                logIndex:         0,
                                transactionIndex: 0,
                                transactionHash:  '0x951f50ad64eaa2a943c023fee1c5d575fbd45696530ac03700575eb495305969',
                                blockHash:        '0x5433cf13f96b154d4c9fcc8ebf3f9880fcad7f953c31da4ebb537ab0fb991821',
                                blockNumber:      5,
                                address:          '0x104b8ff8c4c2d56a381d2953d92ea586972d2b7e',
                                type:             'mined',
                                event:            'LogActivity',
                                args: { 
                                    id:        '11112222',
                                    multiHash: 'QmP2iqTPKtuSsbHKNmdpt3yzoaT6VkovMXR3qh2gn7oUjL',
                                    timestamp: '1553077382' 
                                } 
                        }]
                        status:    '0x1',
                        logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000080000000000000000000',
                        v:         '0x1c',
                        r:         '0x1ce5521161702022d5b60a1b1077cb0826c6d480ebcb036628164589de188798',
                        s:         '0x6faa92106430ea507a28d0364455d2c01bc827346f80e39fc00a66ae58764b82' 
                    }
                }

        - error: undefined

    - When sending no transactionHash
        - statusCode: 400
        - body: undefined
        - error: 

            .. code-block:: JavaScript
                
                { 
                    code:    'BadRequest',
                    message: 'Malformed transaction hash passed in... it should look something like this: 0xecf0b5632c2ffce2ef665e640a286e751949ced4a8614f46b18e225164ffcc8f'
                             'The transaction hash MUST be prefixed with 0x and be 66 total characters long, including the 0x.'
                             'The following was sent: 0xadam.'
                }

    - When sending an invalid transactionHash
        - statusCode: 400
        - body: undefined
        - error: 

            .. code-block:: JavaScript
                
                { 
                    code:    'BadRequest',
                    message: 'Malformed transaction hash passed in... it should look something like this: 0xecf0b5632c2ffce2ef665e640a286e751949ced4a8614f46b18e225164ffcc8f'
                             'The transaction hash MUST be prefixed with 0x and be 66 total characters long, including the 0x.'
                             'The following was sent: 0xadam.'
                }

    - When unable to make a web3 connection to a node
        - statusCode: 412
        - body: undefined
        - error: 

            .. code-block:: JavaScript
                
                { 
                    code:    'PreconditionFailedError',
                    message: 'Unable to create a web3 connection to your Ethereum node... please ensure it is running with an rpc port exposed.'
                }

    - When sending a valid transactionHash that does not exist
        - statusCode: 404
        - body: undefined
        - error: 

            .. code-block:: JavaScript
                
                { 
                    code:    'NotFoundError',
                    message: 'The txHash: 0xbf96b56024317a8942c746fdf5b054d8a870bfcbc7c6d117911a3a7c07249fc1 could not be found. Ensure you are on the correct network... please try again later.'
                }