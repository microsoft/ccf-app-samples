#!/bin/bash
set -euox pipefail

app_path=$PWD
app_name=${app_path##*/}
parent_path=`dirname $PWD`

mkdir -p $app_path/app_certificates

# copy host config file to be used by docker in current directory
cp $parent_path/config/cchost_config_enclave_js.json $app_path/app_certificates/.
cp $parent_path/config/cchost_config_virtual_js.json $app_path/app_certificates/.

# generate\ member0 certificates
# This is directly related to the member described in host config file 
cd $app_path/app_certificates
/opt/ccf/bin/keygenerator.sh --name member0 --gen-enc-key
cd ..

# build enclave image
docker build -t $app_name:js-enclave -f $parent_path/docker/ccf_app_js.enclave .

# build virtual image
docker build -t $app_name:js-virtual -f $parent_path/docker/ccf_app_js.virtual .

# remove host config files copies
rm $app_path/app_certificates/cchost_config_enclave_js.json
rm $app_path/app_certificates/cchost_config_virtual_js.json