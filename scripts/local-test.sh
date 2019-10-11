#!/usr/bin/env bash

# Exit script as soon as a command exits.
set -o errexit

trap cleanup EXIT

ganache_port=8545

cleanup() {
  if lsof -i :$ganache_port -t  >/dev/null; then
      echo "Killing ganache..."
      pid="$(lsof -i :$ganache_port -t)"
      kill -9 $pid
  else
    echo "Ganache died..."
  fi
}

truffle_migrate() {
  yarn truffle migrate --reset
}

# Start client, deploy new contracts and then test
truffle_migrate
node ../test
