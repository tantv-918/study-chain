#!/bin/bash

buildChaincodes () {
    chaincode=academy
    version=1.0

    ./scripts/buildcontract.sh "${chaincode}" "${versions}"

}

buildChaincodes
