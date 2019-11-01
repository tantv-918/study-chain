# Install Samples, Binaries and Docker Images

curl -sSL http://bit.ly/2ysbOFE | bash -s 1.4.0

cp -r fabric-samples/bin

# Generate channel congiguration and achor peer for Orgs

mkdir channel-artifacts

# Các cách triển khai network

## Cách 1

### Bước 1. Tạo cấu hình của network

./generate.sh

### Bước 2. Triển khai network

./start.sh

### Bước 3. Dừng triển khai network

./stop.sh

## Cách 2. Nếu cách 1 lỗi :)

### Bước 1. Comment lại dòng thứ 21 của start.sh

### Bước 2. Tạo cấu hình network

./generate.sh

### Bước 3. Triển khai network

./start.sh

### Bước 4. Chạy container cli sau đó thực hiện thử công các bước bên dưới trong container cli.

docker exec -it cli bash

#### Step 4.1. Create Channel

export CHANNEL_NAME=certificatechannel
peer channel create -o orderer.certificate.com:7050 -c \$CHANNEL_NAME -f ./channel-artifacts/channel.tx

#### Step 4.2. join peer0.academy.certificate.com to the channel

peer channel join -b certificatechannel.block

#### Step 4.3. join peer0.student.certificate.com to the channel

CORE_PEER_ADDRESS=peer0.student.certificate.com:7051 CORE_PEER_LOCALMSPID=StudentMSP CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.certificate.com/users/Admin@student.certificate.com/msp CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.certificate.com/peers/peer0.student.certificate.com/tls/ca.crt peer channel join -b certificatechannel.block

#### Step 4.4. Define the anchor peer for Academy as peer0.academy.certificate.com

CORE_PEER_ADDRESS=peer0.academy.certificate.com:7051 CORE_PEER_LOCALMSPID=AcademyMSP CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/academy.certificate.com/users/Admin@academy.certificate.com/msp CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/academy.certificate.com/peers/peer0.academy.certificate.com/tls/ca.crt peer channel update -o orderer.certificate.com:7050 -c \$CHANNEL_NAME -f ./channel-artifacts/AcademyMSPanchors.tx

#### Step 4.5. Define the anchor peer for Student as peer0.student.certificate.com

CORE_PEER_ADDRESS=peer0.student.certificate.com:8051 CORE_PEER_LOCALMSPID=StudentMSP CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.certificate.com/users/Admin@student.certificate.com/msp CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.certificate.com/peers/peer0.student.certificate.com/tls/ca.crt peer channel update -o orderer.certificate.com:7050 -c \$CHANNEL_NAME -f ./channel-artifacts/StudentMSPanchors.tx

#### Step 4.6. Install the chaincode onto the peer0 node in Academy

CORE_PEER_ADDRESS=peer0.academy.certificate.com:7051 CORE_PEER_LOCALMSPID=AcademyMSP CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/academy.certificate.com/users/Admin@academy.certificate.com/msp CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/academy.certificate.com/peers/peer0.academy.certificate.com/tls/ca.crt peer chaincode install -n academy -v 1.0 -p github.com/chaincode/academy/go/

#### Step 4.7. Instantiate the chaincode onto the peer0 node in Academy

CORE_PEER_ADDRESS=peer0.academy.certificate.com:7051 CORE_PEER_LOCALMSPID=AcademyMSP CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/academy.certificate.com/users/Admin@academy.certificate.com/msp CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/academy.certificate.com/peers/peer0.academy.certificate.com/tls/ca.crt peer chaincode instantiate -o orderer.certificate.com:7050 -C \$CHANNEL_NAME -n academy -v 1.0 -c '{"Args":[]}' -P "OR ('AcademyMSP.peer','StudentMSP.peer')"

#### Step 4.8. Install the chaincode onto the peer0 node in Student

CORE_PEER_ADDRESS=peer0.student.certificate.com:7051 CORE_PEER_LOCALMSPID=StudentMSP CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.certificate.com/users/Admin@student.certificate.com/msp CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/student.certificate.com/peers/peer0.student.certificate.com/tls/ca.crt peer chaincode install -n academy -v 1.0 -p github.com/chaincode/academy/go/

#### Step 4.9. Query Chaincode

peer chaincode query -C \$CHANNEL_NAME -n academy -c '{"Args":["QueryStudent","20156426"]}'

### Bước 5. Dừng triển khai network

exit

./stop.sh
