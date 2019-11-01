#!/bin/bash

#echo
#echo " ____    _____      _      ____    _____ "
#echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
#echo "\___ \    | |     / _ \   | |_) |   | |  "
#echo " ___) |   | |    / ___ \  |  _ <    | |  "
#echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
#echo
#echo
CHAINCODE_NAME="$1"
#VERSION="$2"
TIMEOUT="$4"
: ${CHANNEL_NAME:="certificatechannel"}
: ${CHAINCODE_NAME:=""}
#: ${VERSION:="1.0"}
: ${DELAY:="3"}
: ${TIMEOUT:="10"}
COUNTER=1
MAX_RETRY=5
ORDERER_CA=

CC_SRC_PATH="github.com/chaincode/$CHAINCODE_NAME/go/"

echo "Channel name : "$CHANNEL_NAME
echo "Chaincode name : "$CHAINCODE_NAME
echo "Chaincode version : "$VERSION

source ./scripts/common.sh

installChaincode() {
  CLUSTER=$1
  setGlobals $CLUSTER
  #VERSION=${3:-1.0}
  set -x
  peer chaincode install -n $CHAINCODE_NAME -v 1.0 -p ${CC_SRC_PATH} >&log.txt
  res=$?
  set +x
  cat log.txt
  if [ $CLUSTER -eq 1 ]; then
    verifyResult $res "Chaincode installation on peer0.academy.certificate.com has failed"
    echo "===================== Chaincode is installed on peer0.academy.certificate.com ===================== "
    echo
  elif [ $CLUSTER -eq 2 ]; then
    verifyResult $res "Chaincode installation on peer0.student.certificate.com has failed"
    echo "===================== Chaincode is installed on peer0.student.certificate.com ===================== "
    echo
  fi
}

instantiateChaincode() {
  CLUSTER=$1
  setGlobals $CLUSTER
  #VERSION=${3:-0}

  # while 'peer chaincode' command can get the orderer endpoint from the peer
  # (if join was successful), let's supply it directly as we know it using
  # the "-o" option
  if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
    set -x
    peer chaincode instantiate -o orderer.certificate.com:7050 -C $CHANNEL_NAME -n $CHAINCODE_NAME -v 1.0 -c '{"Args":[]}' -P "OR ('AcademyMSP.member','StudentMSP.member')" >&log.txt
    res=$?
    set +x
  else
    set -x
    peer chaincode instantiate -o orderer.certificate.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -v 1.0 -c '{"Args":[]}' -P "OR ('AcademyMSP.member','StudentMSP.member')" >&log.txt
    res=$?
    set +x
  fi
  cat log.txt

  if [ $CLUSTER -eq 1 ]; then
    verifyResult $res "Chaincode instantiation on peer0.academy.certificate.com on channel '$CHANNEL_NAME' failed"
    echo "===================== Chaincode is instantiated on peer0.academy.certificate.com on channel '$CHANNEL_NAME' ===================== "
    echo
  elif [ $CLUSTER -eq 2 ]; then
    verifyResult $res "Chaincode instantiation on peer0.student.certificate.com on channel '$CHANNEL_NAME' failed"
    echo "===================== Chaincode is instantiated on peer0.student.certificate.com on channel '$CHANNEL_NAME' ===================== "
    echo
  fi
}


## Installing chaincode for academy org
echo "Installing chaincode"
installChaincode 1
sleep 1

## Installing chaincode for academy
echo "Installing chaincode"
installChaincode 2
sleep 1

## Instantiating chaincode
echo "Instantiating chaincode"
instantiateChaincode 1
sleep 1

echo
echo "========= All GOOD, chaincode-instantiate execution completed =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _  \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____ /  "
echo
