#!/usr/bin/env bash

# Leverage to start from docker-compose
# if contracts are not set then this will deploy them before starting the server

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

# Default
network="development"

if [ ! -z "$NETWORK" ]; then
  network="$NETWORK"
fi

echo "Using truffle network: $network"

# Will auto deploy in case of testing locally if the address is not specified
if [ -z "$ACTIVITY_LOGGER_ADDR" ]; then
   echo ""
   echo "***********************"
   echo "Deploying contracts..."
   echo "***********************"
   echo ""
   cd truffle && truffle migrate --network $network --reset
   pid=$!
fi

wait $1

echo "Looks good to me! Starting service..."

node src/cluster
