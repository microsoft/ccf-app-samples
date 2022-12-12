#!/bin/bash
set -euo pipefail

ccf_prefix=/opt/ccf_virtual/bin

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

echo "-- Generating image for $setup_type container"

mkdir -p $app_path/workspace/docker_certificates

echo "-- generating member0 certificates"
# This is directly related to the member described in host config file 
cd $app_path/workspace/docker_certificates
$ccf_prefix/keygenerator.sh --name member0 --gen-enc-key
cd $app_path

echo "-- Running docker build command"
docker build -t $app_name:${setup_type} -f $app_path/docker/ccf_app_js.${setup_type} .