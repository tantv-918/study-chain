#!/bin/bash

# verify the result of the end-to-end test
verifyResult () {
	if [ $1 -ne 0 ] ; then
		echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo "========= ERROR !!! FAILED to execute End-2-End Scenario ==========="
		echo
   	exit 1
	fi
}

# Set OrdererOrg.Admin globals
setOrdererGlobals() {
    CORE_PEER_LOCALMSPID="OrdererMSP"
    CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/certificate.com/msp/tlscacerts/tlsca.certificate.com-cert.pem
    CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/academy.certificate.com/users/Admin@academy.certificate.com/msp
}

setGlobals () {
	CLUSTER=$1
	if [ $CLUSTER -eq 1 ] ; then
		CORE_PEER_LOCALMSPID=AcademyMSP
		CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/academy.certificate.com/peers/peer0.academy.certificate.com/tls/ca.crt
		CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/academy.certificate.com/users/Admin@academy.certificate.com/msp
		CORE_PEER_ADDRESS=peer0.academy.certificate.com:7051
	elif [ $CLUSTER -eq 2 ] ; then
		CORE_PEER_LOCALMSPID=StudentMSP
		CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.certificate.com/peers/peer0.student.certificate.com/tls/ca.crt
		CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.certificate.com/users/Admin@student.certificate.com/msp
		CORE_PEER_ADDRESS=peer0.student.certificate.com:7051
	else
		echo "================== ERROR !!! ORGANIZATION Unknown =================="
	fi

	env |grep CORE
}
