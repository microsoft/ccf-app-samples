#!/bin/bash
set -euox pipefail


# create member0 certificates
mkdir -p config_and_certs
cp ../config/cchost_config_enclave_js.json config_and_certs/.
cp ../config/cchost_config_virtual_js.json config_and_certs/.

cd config_and_certs
/opt/ccf/bin/keygenerator.sh --name member0 --gen-enc-key
cd ..

# build enclave image
docker build -t ccf-app-template:js-enclave -f ../docker/ccf_app_js.enclave .

# build virtual image
docker build -t ccf-app-template:js-virtual -f ../docker/ccf_app_js.virtual .
