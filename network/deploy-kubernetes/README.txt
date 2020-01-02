kubectl apply -f kubernetes/fabric-pv.yaml

kubectl apply -f kubernetes/fabric-pvc.yaml

kubectl apply -f kubernetes/backup-academypeer0-pv.yaml

kubectl apply -f kubernetes/backup-academypeer0-pvc.yaml

kubectl apply -f kubernetes/backup-academypeer1-pv.yaml

kubectl apply -f kubernetes/backup-academypeer1-pvc.yaml

kubectl apply -f kubernetes/backup-studentpeer0-pv.yaml

kubectl apply -f kubernetes/backup-studentpeer0-pvc.yaml

kubectl apply -f kubernetes/backup-studentpeer1-pv.yaml

kubectl apply -f kubernetes/backup-studentpeer1-pvc.yaml

kubectl apply -f kubernetes/fabric-tools.yaml

kubectl exec -it fabric-tools -- mkdir /fabric/config

kubectl cp config/configtx.yaml fabric-tools:/fabric/config/

kubectl cp config/crypto-config.yaml fabric-tools:/fabric/config/

kubectl cp config/chaincode/ fabric-tools:/fabric/config/

kubectl exec -it fabric-tools -- mkdir -p /opt/gopath/src/github.com/hyperledger

kubectl cp ~/go/src/github.com/hyperledger/fabric  fabric-tools:/opt/gopath/src/github.com/hyperledger/

kubectl cp ~/go/src/github.com/golang  fabric-tools:/opt/gopath/src/github.com/

kubectl exec -it fabric-tools -- /bin/bash
cryptogen generate --config /fabric/config/crypto-config.yaml
exit

kubectl exec -it fabric-tools -- /bin/bash
cp -r crypto-config /fabric/
cp -r /opt/gopath/src/github.com/hyperledger/fabric/core/chaincode/lib/cid /opt/gopath/src/github.com/hyperledger/fabric/core/chaincode/
exit

kubectl exec -it fabric-tools -- /bin/bash
cp /fabric/config/configtx.yaml /fabric/
cd /fabric
configtxgen -profile TwoOrgsOrdererGenesis -channelID $SYS_CHANNEL -outputBlock genesis.block
configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME
exit

kubectl exec -it fabric-tools -- /bin/bash
cd /fabric
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate AcademyMSPanchors.tx -channelID $CHANNEL_NAME -asOrg AcademyMSP
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate StudentMSPanchors.tx -channelID $CHANNEL_NAME -asOrg StudentMSP
exit

kubectl exec -it fabric-tools -- /bin/bash
chmod a+rx /fabric/* -R
exit

kubectl apply -f kubernetes/academy-ca_deploy.yaml
kubectl apply -f kubernetes/academy-ca_svc.yaml

kubectl apply -f kubernetes/student-ca_deploy.yaml
kubectl apply -f kubernetes/student-ca_svc.yaml

kubectl apply -f kubernetes/certificate-orderer_deploy.yaml
kubectl apply -f kubernetes/certificate-orderer_svc.yaml

kubectl apply -f kubernetes/academypeer0_deploy.yaml
kubectl apply -f kubernetes/academypeer1_deploy.yaml
kubectl apply -f kubernetes/academypeer0_svc.yaml
kubectl apply -f kubernetes/academypeer1_svc.yaml

kubectl apply -f kubernetes/studentpeer0_deploy.yaml
kubectl apply -f kubernetes/studentpeer1_deploy.yaml
kubectl apply -f kubernetes/studentpeer0_svc.yaml
kubectl apply -f kubernetes/studentpeer1_svc.yaml

kubectl exec -it fabric-tools -- /bin/bash
cd /fabric
export ORDERER_URL="certificate-orderer:31010"
export CORE_PEER_ADDRESSAUTODETECT="false"
export CORE_PEER_NETWORKID="nid1"
export CORE_PEER_LOCALMSPID="AcademyMSP"
export CORE_PEER_MSPCONFIGPATH="/fabric/crypto-config/peerOrganizations/academy.certificate.com/users/Admin@academy.certificate.com/msp"
export FABRIC_CFG_PATH="/etc/hyperledger/fabric"
export CORE_PEER_ADDRESS="certificate-academypeer0:30110"
peer channel create -o ${ORDERER_URL} -c ${CHANNEL_NAME} -f /fabric/${CHANNEL_NAME}.tx
exit

kubectl exec -it fabric-tools -- /bin/bash

export CORE_PEER_NETWORKID="nid1"
export ORDERER_URL="certificate-orderer:31010"
export FABRIC_CFG_PATH="/etc/hyperledger/fabric"
export CORE_PEER_LOCALMSPID="AcademyMSP"
export CORE_PEER_MSPCONFIGPATH="/fabric/crypto-config/peerOrganizations/academy.certificate.com/users/Admin@academy.certificate.com/msp"

export CORE_PEER_ADDRESS="certificate-academypeer0:30110"
peer channel fetch newest -o ${ORDERER_URL} -c ${CHANNEL_NAME}
peer channel join -b ${CHANNEL_NAME}_newest.block
rm -rf /${CHANNEL_NAME}_newest.block

export CORE_PEER_ADDRESS="certificate-academypeer1:30110"
peer channel fetch newest -o ${ORDERER_URL} -c ${CHANNEL_NAME}
peer channel join -b ${CHANNEL_NAME}_newest.block
rm -rf /${CHANNEL_NAME}_newest.block

exit

kubectl exec -it fabric-tools -- /bin/bash
export CORE_PEER_NETWORKID="nid1"
export ORDERER_URL="certificate-orderer:31010"
export FABRIC_CFG_PATH="/etc/hyperledger/fabric"
export CORE_PEER_LOCALMSPID="StudentMSP"
export CORE_PEER_MSPCONFIGPATH="/fabric/crypto-config/peerOrganizations/student.certificate.com/users/Admin@student.certificate.com/msp"

export CORE_PEER_ADDRESS="certificate-studentpeer0:30110"
peer channel fetch newest -o ${ORDERER_URL} -c ${CHANNEL_NAME}
peer channel join -b ${CHANNEL_NAME}_newest.block

rm -rf /${CHANNEL_NAME}_newest.block

export CORE_PEER_ADDRESS="certificate-studentpeer1:30110"
peer channel fetch newest -o ${ORDERER_URL} -c ${CHANNEL_NAME}
peer channel join -b ${CHANNEL_NAME}_newest.block

rm -rf /${CHANNEL_NAME}_newest.block
exit

kubectl exec -it fabric-tools -- /bin/bash
cp -r /fabric/config/chaincode $GOPATH/src/
export CHAINCODE_NAME="academy"
export CHAINCODE_VERSION="1.0"
export FABRIC_CFG_PATH="/etc/hyperledger/fabric"
export CORE_PEER_MSPCONFIGPATH="/fabric/crypto-config/peerOrganizations/academy.certificate.com/users/Admin@academy.certificate.com/msp"
export CORE_PEER_LOCALMSPID="AcademyMSP"

export CORE_PEER_ADDRESS="certificate-academypeer0:30110"
peer chaincode install -n ${CHAINCODE_NAME} -v ${CHAINCODE_VERSION} -p chaincode/academy/

export CORE_PEER_ADDRESS="certificate-academypeer1:30110"
peer chaincode install -n ${CHAINCODE_NAME} -v ${CHAINCODE_VERSION} -p chaincode/academy/

exit

kubectl exec -it fabric-tools -- /bin/bash
cp -r /fabric/config/chaincode $GOPATH/src/
export CHAINCODE_NAME="academy"
export CHAINCODE_VERSION="1.0"
export FABRIC_CFG_PATH="/etc/hyperledger/fabric"
export CORE_PEER_MSPCONFIGPATH="/fabric/crypto-config/peerOrganizations/student.certificate.com/users/Admin@student.certificate.com/msp"
export CORE_PEER_LOCALMSPID="StudentMSP"

export CORE_PEER_ADDRESS="certificate-studentpeer0:30110"
peer chaincode install -n ${CHAINCODE_NAME} -v ${CHAINCODE_VERSION} -p chaincode/academy/

export CORE_PEER_ADDRESS="certificate-studentpeer1:30110"
peer chaincode install -n ${CHAINCODE_NAME} -v ${CHAINCODE_VERSION} -p chaincode/academy/

exit

kubectl exec -it fabric-tools -- /bin/bash
export CHAINCODE_NAME="academy"
export CHAINCODE_VERSION="1.0"
export FABRIC_CFG_PATH="/etc/hyperledger/fabric"
export CORE_PEER_MSPCONFIGPATH="/fabric/crypto-config/peerOrganizations/academy.certificate.com/users/Admin@academy.certificate.com/msp"
export CORE_PEER_LOCALMSPID="AcademyMSP"
export CORE_PEER_ADDRESS="certificate-academypeer0:30110"
export ORDERER_URL="certificate-orderer:31010"
export FABRIC_LOGGING_LEVEL=debug

peer chaincode instantiate -o ${ORDERER_URL} -C ${CHANNEL_NAME} -n ${CHAINCODE_NAME} -v ${CHAINCODE_VERSION} -P "OR ('AcademyMSP.peer','StudentMSP.peer') " -c '{"Args":[]}'
exit

kubectl exec -it fabric-tools -- /bin/bash
export CORE_PEER_LOCALMSPID="AcademyMSP"
export FABRIC_CFG_PATH="/etc/hyperledger/fabric"
export CORE_PEER_MSPCONFIGPATH="/fabric/crypto-config/peerOrganizations/academy.certificate.com/users/Admin@academy.certificate.com/msp"
export CORE_PEER_ADDRESS="certificate-academypeer0:30110"
export ORDERER_URL="certificate-orderer:31010"
export FABRIC_LOGGING_LEVEL=debug
peer channel update -f /fabric/AcademyMSPanchors.tx -c $CHANNEL_NAME  -o $ORDERER_URL
exit

kubectl exec -it fabric-tools -- /bin/bash
export CORE_PEER_LOCALMSPID="StudentMSP"
export FABRIC_CFG_PATH="/etc/hyperledger/fabric"
export CORE_PEER_MSPCONFIGPATH="/fabric/crypto-config/peerOrganizations/student.certificate.com/users/Admin@student.certificate.com/msp"
export CORE_PEER_ADDRESS="certificate-studentpeer0:30110"
export ORDERER_URL="certificate-orderer:31010"
export FABRIC_LOGGING_LEVEL=debug
peer channel update -f /fabric/StudentMSPanchors.tx -c $CHANNEL_NAME  -o $ORDERER_URL
exit

kubectl exec -it fabric-tools -- /bin/bash
export FABRIC_CFG_PATH="/etc/hyperledger/fabric"
export ORDERER_URL="certificate-orderer:31010"
export CORE_PEER_LOCALMSPID="AcademyMSP"
export CORE_PEER_MSPCONFIGPATH="/fabric/crypto-config/peerOrganizations/academy.certificate.com/users/Admin@academy.certificate.com/msp"
export CORE_PEER_ADDRESS="certificate-academypeer0:30110"

peer chaincode invoke --peerAddresses certificate-academypeer0:30110 -o certificate-orderer:31010 -C certificatechannel -n academy -c '{"Args":["CreateStudent","20156425","Trinh Van Tan"]}'

peer chaincode query -C certificatechannel -n academy -c '{"Args": ["GetAllStudents"]}'
exit
