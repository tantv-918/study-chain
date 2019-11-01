#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
TIMEOUT="$4"
: ${CHANNEL_NAME:=certificatechannel}
: ${DELAY:="3"}
: ${TIMEOUT:="10"}
LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
COUNTER=1
MAX_RETRY=5
ORDERER_CA=

CC_SRC_PATH="github.com/chaincode/academy/go"

echo "Channel name : "$CHANNEL_NAME

source ./scripts/common.sh

updateAnchorPeers() {
    CLUSTER=$1
    setGlobals $CLUSTER

    if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
            set -x
        peer channel update -o orderer.certificate.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx >&log.txt
        res=$?
            set +x
    else
            set -x
        peer channel update -o orderer.certificate.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
        res=$?
            set +x
    fi
    cat log.txt
	if [ $CLUSTER -eq 1 ]; then
    	verifyResult $res "Anchor peer update failed"
    	echo "===================== Anchor peers for CLUSTER \"$CORE_PEER_LOCALMSPID\" on \"$CHANNEL_NAME\" is updated successfully ===================== "
    	sleep $DELAY
    	echo
	elif [ $CLUSTER -eq 2 ]; then
		verifyResult $res "Anchor peer update failed"
    	echo "===================== Anchor peers for CLUSTER \"$CORE_PEER_LOCALMSPID\" on \"$CHANNEL_NAME\" is updated successfully ===================== "
    	sleep $DELAY
    	echo
	else
		echo "================== ERROR !!! ORGANIZATION Unknown =================="
	fi
}

## Sometimes Join takes time hence RETRY at least for 5 times
joinChannelWithRetry () {
	CLUSTER=$1
	setGlobals $CLUSTER

        set -x
	peer channel join -b $CHANNEL_NAME.block  >&log.txt
	res=$?
        set +x
	cat log.txt
	if [ $res -ne 0 -a $COUNTER -lt $MAX_RETRY ]; then
		COUNTER=` expr $COUNTER + 1`
		echo "peer${PEER}.${CLUSTER} failed to join the channel, Retry after $DELAY seconds"
		sleep $DELAY
		joinChannelWithRetry $PEER $CLUSTER
	else
		COUNTER=1
	fi
	verifyResult $res "After $MAX_RETRY attempts, peer${PEER}.${CLUSTER} has failed to Join the Channel"
}

createChannel() {
	setGlobals 1

	if [ -z "$CORE_PEER_TLS_ENABLED" -o "$CORE_PEER_TLS_ENABLED" = "false" ]; then
            set -x
		peer channel create -o orderer.certificate.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx >&log.txt
		res=$?
            set +x
	else
            set -x
		peer channel create -o orderer.certificate.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
		res=$?
            set +x
	fi
	cat log.txt
	verifyResult $res "Channel creation failed"
	echo "===================== Channel \"$CHANNEL_NAME\" is created successfully ===================== "
	echo
}


joinChannel () {
	for cluster in 1 2; do
		joinChannelWithRetry $cluster
		if [ $CLUSTER -eq 1 ]; then
			echo "===================== peer0.academy.certificate.com joined on the channel \"$CHANNEL_NAME\" ===================== "
			sleep $DELAY
			echo
		elif  [ $CLUSTER -eq 2 ]; then
			echo "===================== peer0.student.certificate.com joined on the channel \"$CHANNEL_NAME\" ===================== "
			sleep $DELAY
			echo
		fi
	done
}


## Create channel
echo "Creating channel..."
createChannel
sleep $DELAY
## Join all the peers to the channel
echo "Having all peers join the channel..."
joinChannel

## Set the anchor peers for each cluster in the channel
echo "Updating anchor peers for academy..."
updateAnchorPeers 1
echo "Updating anchor peers for student..."
updateAnchorPeers 2


echo
echo "========= All GOOD, up-network execution completed =========== "
echo
