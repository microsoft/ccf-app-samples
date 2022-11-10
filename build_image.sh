#!/bin/bash
set -euo pipefail

if [ $# -eq 0 ]
  then
    echo "No argument supplied. Define either 'virtual' or 'enclave'";
    exit
fi

if [ "$1" != "virtual" -a "$1" != "enclave" ];then 
    echo "Wrong argument value. Define either 'virtual' or 'enclave'";
    exit
fi

setup_type=$1
app_path=$PWD
app_name=${app_path##*/}
parent_path=`dirname $PWD`

echo "-- Generating image for $setup_type" container.

mkdir -p $app_path/app_certificates

echo "-- Copying host config file to be used by docker in current directory"
cp $parent_path/config/cchost_config_${setup_type}_js.json $app_path/app_certificates/.

echo "-- generating member0 certificates"
# This is directly related to the member described in host config file 
cd $app_path/app_certificates
/opt/ccf/bin/keygenerator.sh --name member0 --gen-enc-key
cd ..

echo "-- Running docker build command"
docker build -t $app_name:${setup_type} -f $parent_path/docker/ccf_app_js.${setup_type} .

echo "-- Removing host config files copies"
rm $app_path/app_certificates/cchost_config_${setup_type}_js.json