#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

bash ./replace-privatekey.sh
#sleep 1


# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

docker-compose -f docker-compose.yaml -f docker-compose-couch.yaml down

docker-compose -f docker-compose.yaml -f docker-compose-couch.yaml up -d 2>&1

docker exec -it cli bash scripts/execution.sh
