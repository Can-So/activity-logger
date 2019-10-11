1. Add Activity
---------------

Add a new activity to be logged.  This route will add a new image to IPFS and log the multihash to the Ethereum blockchain.

- URL: ``/addActivity``
- Method: ``POST``
- Body:
    - id *[required]*
        - string
        - The id of the user / account that is logging the activity
    - imageUrl *[required]*
        - string
        - The url where the raw image data lives
    - metadata *[required]*
        - string
        - Extended data field
        
- Example Request
    
    .. code-block:: JavaScript

        const fs = require('fs');
        const rp = require('request-promise');

        const id   = '11112222';
        const imageUrl = ''https://response.restoration.noaa.gov/sites/default/files/images/13/cleanup-workers-shoveling-oil-into-bag-sandy-beach-refugio_coast-guard_980.jpg';
        const metadata = 'some metadata';

        const options = {
            url:    `http://localhost:3001/addActivity`,
            method: 'POST',
            json:   true,
            resolveWithFullResponse: true,
            simple: true,
            body: {
                id, 
                imageUrl,
                metadata,
            }
        };
        
        sendRequest(options);

        async function sendRequest(options) {
            const response = await rp(options);
            console.log(response.statusCode);
            console.log(response.body);
            console.log(response.error);
        }

- Example Responses
    - Successfully added activity
        - statusCode: 201
        - body: 

            .. code-block:: JavaScript
                
                { 
                    transactionHash: '0xecf0b5632c2ffce2ef665e640a286e751949ced4a8614f46b18e225164ffcc8f',
                    ipfsHash:        'QmP2iqTPKtuSsbHKNmdpt3yzoaT6VkovMXR3qh2gn7oUjL' 
                }
        - error: undefined

    - When sending no id
        - statusCode: 400
        - body: undefined
        - error: 

            .. code-block:: JavaScript
                
                { 
                    code:    'BadRequest',
                    message: 'Id must be a valid string the following is invalid: undefined' 
                }

    - When sending no imageUrl
        - statusCode: 400
        - body: undefined
        - error: 

            .. code-block:: JavaScript
                
                { 
                    code:    'BadRequest',
                    message: 'imageUrl must be a valid string the following is invalid: undefined'
                }

    - When sending an invalid URL
        - statusCode: 400
        - body: undefined
        - error: 

            .. code-block:: JavaScript
                
                { 
                    code:    'BadRequest',
                    message: 'Error while retrieving image: Error: Invalid URI "invalid"' 
                }

    - When unable to create a connection to the ipfs node
        - statusCode: 502
        - body: undefined
        - error: 

            .. code-block:: JavaScript
                
                { 
                    code:    'BadGatewayError',
                    message: 'Can not create a connection to the IPFS node @ ipfs.infura.io:5001' 
                }