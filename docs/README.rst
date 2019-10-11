Activity Logging Service
========================

The service has been designed to securely and efficiently log activity information to the Ethereum blockchain.

This information may involve images or files as well as text descriptions associated to a specific activity.

The raw information that is provided will be stored across decentralized and permanent file storage leveraging `IPFS (Interplanetary File System) <https://ipfs.io/>`_
technology.  A unique identifier or fingerprint is returned from IPFS which will then be securely logged to the Ethereum blockchain. 

Therefore the security and data integrity guarantees of the information exist while optimizing for cost and speed efficiencies as only
32 bytes are stored on Ethereum. In fact, further optimization has been taken to only *log* this information within the Ethereum Virtual Machine's (EVM)
event logs and not write to storage.  This saves further on cost of utilizing such public networks.

An example of a successful transaction can be found `here <https://ropsten.etherscan.io/tx/0xff16faf2c0f84efa76cd915c04f3180fdcf2fe675e05cb7458e0f9902541054e#eventlog>`_ 
on the public Ropsten network.  
Where data fields 7 and 8, due to EVM encoding, form the IPFS multihash, ``Qmc5mzWeduBv6qPtsazMsPZqUvvvbMpVjJJTMsJoGQ8hZP``, or identifier which may be utilized to access the raw data at:
``https://gateway.ipfs.io/ipfs/${multihash}`` or `https://gateway.ipfs.io/ipfs/Qmc5mzWeduBv6qPtsazMsPZqUvvvbMpVjJJTMsJoGQ8hZP <https://gateway.ipfs.io/ipfs/Qmc5mzWeduBv6qPtsazMsPZqUvvvbMpVjJJTMsJoGQ8hZP>`_

The service is comprised of 3 core components:

    1. Activity Logging Microservice
        - The core Nodejs and Restify based microservice exposing a simple REST interface for interaction.
        - The microservice is entirely Dockerized and utilizes the power of Docker for lightweight deployment and management.
        - The service has been designed to handle potentially large request volumes leveraging node's core cluster module enabling
          many worker threads to be spawned and work allocated as needed.

    2. Ethereum Node
        - A Parity powered node configured and connected to the Ropsten public Ethereum test network.
        - The node has one available and funded account that all transactions are currently routed through here `0xfb15a5b48635442f04e826006fdc0a8d463ec3ff <https://ropsten.etherscan.io/address/0xfb15a5b48635442f04e826006fdc0a8d463ec3ff>`_.

    3. IPFS Infura Node
        - `Infura <https://infura.io/>`_ was utilized to limit infrastructure burden and enable interaction with the public IPFS network.
        - Pinning schemes for data persistence will be required in future to ensure data is retained across the network.

The Ethereum node and service are deployed to separate VMs across separate physical servers.

Repo Anatomy
-------------

1. src
    - The core source code of the service including all API routes.  The service is booted from ``cluster.js`` which will then 
      spawn the defined number of worker threads to handle anticipated volumes.
    - All configuration of the service may be done directly in the ``constants.js`` file where the default values for several
      config parameters are defined or may be done by directly specifying environment variables as are utilized within the docker-compose files for deployment.

2. test
    - The major test directory for the service itself including local and prod test suites.

3. truffle
    - All Smart Contract code including Solidity and test suites.  This folder resembles a truffle project.

4. root
    - Within the root of the project there exists primarily the core compose deployment files as well as the Dockerfile build file for the service as a whole.

----

API Usage
====

1. `Add Activity <./addActivity.rst>`_

2. `Get Transaction <./getTransaction.rst>`_ 

----

Monitoring
==========

The current deployment of the service is hosted atop Azure at the static IP address of ``40.86.203.135``.

The service is running on port 3033 and exposing the 2 routes noted above ``addActivity`` and ``getTransaction``.

Details on technical usage and integration have been noted in the API section above as well as example requests shared
via an external Postman collection.

For ease of monitoring and accessing the service credentials have been given to access the machine:

    1. ssh into the VM
        - The login credentials shall be provided via secure communication channel

        .. code-block:: console

            ssh mc2@40.86.203.135

    2. Change in to ``blg`` user directory which is where the  docker-compose file lives

        .. code-block:: console

            cd ../blg

    3. Tail the logs of the container
        - From the directory of the compose file you may then tail the logs of the service

        .. code-block:: console

            docker-compose logs -f

----

Testing and Development
=======================

Installation
------------

To begin working with the repo first clone the contents and install the dependencies.

Local dependencies include ``node v10+`` and ``yarn v1.10+``

    .. code-block:: console

        git clone https://github.com/Blockchain-Learning-Group/blockscale-activity-logging-service.git
        cd blockscale-activity-logging-service
        yarn

Testing
-------

1. The Smart Contracts may be tested independently

    .. code-block:: console

        cd truffle
        yarn truffle develop
        test

2. Testing the service locally may be accomplished from within the root directory
    - This command will boot up a local ganache node to emulate an Ethereum blockchain to test against
    - The migration will be executed to also create a Smart Contract to test the service against
    - Finally the serivce is booted and tested directly
    - Following completion everything is cleaned including the ganache instance

    .. code-block:: console

        yarn test

3. Test against the production deployment
    - The production server URL has been configured within the constants and it is this location that the tests will be executed against

    .. code-block:: console

        yarn test-prod

Development
-----------

Development tools such as ``ganache-cli`` and ``truffle`` are also on board and at your disposal
    
    1. ganache-cli
        - Boot a local Ethereum emulation

        .. code-block:: console

            yarn ganache

    2. truffle: ``yarn truffle <command>``
        - Smart contract development framework

        .. code-block:: console

            yarn truffle develop
            yarn truffle migrate
            yarn truffle test

    3. Starting the service

        - If the address of the deployed contract is defined in the environment than the contract will first be deployed
          to the detected Ethereum network.  If an address is defined than deployment is omitted.

            .. code-block:: console

                yarn start

        - If you wish to start the service independently you may just start the cluster directly.

            .. code-block:: console

                yarn start-cluster

----

Deploy
======

Ethereum Node
-------------

We recommend running a node of your own connected to the network you wish to interact with in order to provide greater availability
and reduce trust on other members of the network to broadcast your transactions.  You may also look to manage accounts or other within this node.
Your node can then be used to listen or watch for certain events more efficiently to notify other services or applications of a 
given transaction's execution.

Therefore, a compatible Ethereum client will need to be installed on the machine you wish to host your node.

1. We recommend utilizing `Parity <https://www.parity.io/ethereum/>`_ which may be installed for mac and linux with a single line:

    .. code-block:: console

        bash <(curl https://get.parity.io -L)

2. The node will then need to be configured and synced to the network of your choosing. For example Ropsten below.

    .. code-block:: console

        parity --chain ropsten --bootnodes "enode://6332792c4a00e3e4ee0926ed89e0d27ef985424d97b6a45bf0f23e51f0dcb5e66b875777506458aea7af6f9e4ffb69f43f3778ee73c81ed9d34c51c4b16b0b0f@52.232.243.152:30303,enode://94c15d1b9e2fe7ce56e458b9a3b672ef11894ddedd0c6f247e0f1d3487f52b66208fb4aeb8179fce6e3a749ea93ed147c37976d67af557508d199d9594c35f09@192.81.208.223:30303"

3. An account which you wish to send transactions and general permissioning and security of your node may further be configured.

Service
-------

.. note:: 

    Note this section is configured to be deployed under BLG docker hub credentials but can be configured for other.

1. Build the images

    .. code-block:: console

        yarn build

2. Push the images to Docker Hub

    .. code-block:: console

        yarn push

3. Deploy the given contract to Ropsten or any other network
    
    .. note:: 

        The current prod node specifically has been locked down to not allow connections of this nature but a separate node
        may be configured to support such requests in the same manner.

    .. code-block:: console

        cd truffle
        yarn truffle console --network ropsten
        deploy

    * Copy the resulting address that the contract was deployed to and note it within the prod compose file for the service to interact with.
    Update the environment variable for the service as such: ``ACTIVITY_LOGGER_ADDR: "0xa474f10ab92b3092445b7da15bbe7b60719a7297"``

4. Create the compose file on the machine to deploy to with the contents of ``docker-compose.ropsten.prod.yml``

    .. note:: 
    
        The server you wish to deploy to must have docker-compose installed

    .. code-block:: console

        docker-compose up

    or locally withing the repo:

    .. code-block:: console

        docker-compose -f docker-compose.ropsten.prod.yml up

----

Future Work
===========

1. Authentication and secure transport
2. Account management and node configuration
3. IPFS management and data pinning 
4. Extend on-chain and service functionality
5. Mainnet migration and planning
6. Async interaction and event notification within mobile / web application(s)