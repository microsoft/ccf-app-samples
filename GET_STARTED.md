# Get Started: Application Development using CCF

## Overview
Get started repository for building CCF applications using (JavaScript, TypeScript and C++).

## Quick start
What is CCF: The [Confidential Consortium Framework (CCF)](https://ccf.dev/) is an open-source framework for building a new category of secure, highly available,
and performant applications that focus on multi-party compute and data.

- Read the [CCF overview](https://microsoft.github.io/CCF/main/overview/index.html) and get familiar with [CCF's core concepts](https://microsoft.github.io/CCF/main/overview/what_is_ccf.html) and [Azure confidential computing](https://learn.microsoft.com/en-us/azure/confidential-computing/)
- [Build new CCF applications](https://microsoft.github.io/CCF/main/build_apps/index.html) in TypeScript/JavaScript or C++
- CCF [Modules API reference](https://microsoft.github.io/CCF/main/js/ccf-app/modules.html)
- CCF application get started repos
    -  [CCF application template](https://github.com/microsoft/ccf-app-template)
    -  [CCF application samples](https://github.com/microsoft/ccf-app-samples)

## Supported Programing Languages
Applications can be written in
- TypeScript
- JavaScript
- C++
- More languages support upcoming on 2023

## Development environment
- Development container and VSCode [![Open in VSCode](https://img.shields.io/static/v1?label=Open+in&message=VSCode&logo=visualstudiocode&color=007ACC&logoColor=007ACC&labelColor=2C2C32)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/microsoft/ccf-app-samples) 
- Github codespace: [![Github codespace](https://img.shields.io/static/v1?label=Open+in&message=GitHub+codespace&logo=github&color=2F363D&logoColor=white&labelColor=2C2C32)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=496290904&machine=basicLinux32gb&devcontainer_path=.devcontainer.json&location=WestEurope)
- Linux Machine ([Create a VM](https://learn.microsoft.com/en-us/azure/confidential-computing/quick-create-portal) and [Install ccf](https://microsoft.github.io/CCF/main/build_apps/install_bin.html))

## <img src="https://user-images.githubusercontent.com/42961061/191275583-88e00f94-73aa-4d66-9786-047987eb9fa9.png" height=50px> </img>  (JS/Typescript) Applications
To test a ccf application you need go through the following steps:
- Start a CCF Network with at least one node
- Initialize the CCF network with at least one (active member - user), this is done through [Network Governance Proposals](https://microsoft.github.io/CCF/main/governance/proposals.html).
- Create an application [deployment proposal](https://microsoft.github.io/CCF/main/build_apps/js_app_bundle.html)
- Submit the app deployment proposal to the network and all members accept it through voting, This is a part of [Network Governance](https://microsoft.github.io/CCF/main/governance/proposals.html).
- Open the CCF network for users
- Start to test your application endpoints

### Build Application

The application building prerequisites [[CCF](#ccf-install), NodeJS and NPM] installed, all will be preinstalled if you are using devcontainer enviroment,
otherwise you need to manually install.

In the checkout of this repository:

```bash
cd js
npm install
npm run build
ls
cd ..

# a dist folder is created with app bundle.
```
---
### Testing your Application

There are servral ways and tools which helping to test your application
- Sandbox.sh 
    - build an initialized a ccf network and deploy your app top it
    - Support both ccf network types [virtual - release (TEE hardware)]
    - No governance steps required

- Docker container 
    - Support both ccf network types [virtual - release (TEE hardware)]
    - Governance steps required to deploy your app, initialize, and start the network

- Linux Machine
    - Support both ccf network types [virtual - release (TEE hardware)]
    - Governance steps required to deploy your app, initialize, and start the network

#### Testing: Using Sandbox.sh

By runing sandbox.sh script, it is automatically starting a CCF network and deploy your application on it, the app is up and ready to receive calls,
all the governance work is done for you.

Start in a CCF Network in Release mode
```bash
/opt/ccf/bin/sandbox.sh --js-app-bundle ./js/dist/  --enclave-type release -p /opt/ccf/lib/libjs.enclave.so.signed
...
[12:00:00.000] Press Ctrl+C to shutdown the network
# It is then possible to interact with the service
```

Start in a CCF Network in Virtual mode (the default mode for testing)
```bash
/opt/ccf/bin/sandbox.sh --js-app-bundle ./js/dist/
...
[12:00:00.000] Press Ctrl+C to shutdown the network
# It is then possible to interact with the service
```

#### Testing: Using docker containers

Build and run one of these docker files ["ccf_app_js.virtual" or "ccf_app_js.enclave"] to start a CCF network with one node and one member
after that you need to execute governance steps to deploy the application and open the network for users to begin access the app endpoints.
all the governance steps is done manually using [proposal submit and vote process](https://microsoft.github.io/CCF/main/governance/proposals.html).

##### Build and run docker container to start a CCF network

Start in a CCF Network in Release mode, via docker container based on config file "./config/cchost_config_enclave_js.json"

```bash
 docker build -t ccf-app-samples:js-enclave -f docker/ccf_app_js.enclave .
 docker run -d --device /dev/sgx_enclave:/dev/sgx_enclave --device /dev/sgx_provision:/dev/sgx_provision -v /dev/sgx:/dev/sgx ccf-app-samples:js-enclave
 ...
 # CCF Network initialization needed before the interaction with the service
```

Start in a CCF Network in Virtual mode, based on virtual config file: "./config/cchost_config_virtual_js.json":
```bash
 docker build -t ccf-app-samples:js-virtual -f docker/ccf_app_js.virtual .
 docker run -d ccf-app-samples:js-virtual
 ...
 # CCF Network initialization needed before the interaction with the service
```

##### CCF Node Configuration file
The configuration for each CCF node must be contained in a single JSON configuration file like [cchost_config_enclave_js.json - cchost_config_virtual_js.json], [ CCF node config file documentation](https://microsoft.github.io/CCF/main/operations/configuration.html)

##### CCF network initialization
After the container run, a network is started with one (node - member), you need to execute the following governance steps to initialize the network, [check Network governance section](#network-governance)
- Activate the network members (to begin network governance)
- Add users (using proposal)
- Deploy the application (using proposal)
- Open the network for users (using proposal)

#### Testing: Using Linux Machine
To Start a test CCF network on a VM, it requires [CCF to be intalled](https://microsoft.github.io/CCF/main/build_apps/install_bin.html)

Start the CCF network using the cchost in release mode
```bash
 /opt/ccf/bin/cchost --config ./config/cchost_config_enclave_js.json
```
Or virtual mode
```bash
/opt/ccf/bin/cchost --config ./config/cchost_config_virtual_js.json
```

##### CCF Node Configuration file
The configuration for each CCF node must be contained in a single JSON configuration file like [cchost_config_enclave_js.json - cchost_config_virtual_js.json], [ CCF node config file documentation](https://microsoft.github.io/CCF/main/operations/configuration.html)

##### CCF network initialization
Network is started with one (node - member), you need to execute the following governance steps to initialize the network,, [check Network governance section](#network-governance)
- Activate the network members (to start a network governance)
- Add users (using proposal)
- Deploy the application (using proposal)
- Open the network for users (using proposal)

### Testing: Application Endpoints  

Now you can send requests to your endpoints, the following sample requests to log application [(ccf-app-template)](https://github.com/microsoft/ccf-app-template/tree/main/js)

In another terminal:

#### Log application
```bash
 # send log message to be saved
 curl -X POST https://127.0.0.1:8000/app/log?id=1 --cacert ./workspace/sandbox_common/service_cert.pem -H "Content-Type: application/json" --data '{"msg": "hello world"}'
 # retrieve log message
 curl https://127.0.0.1:8000/app/log?id=1 --cacert ./workspace/sandbox_common/service_cert.pem
 # return:> hello world
```

#### Banking application
```bash
echo "Define vars"
user0_id=$(openssl x509 -in "user0_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
user1_id=$(openssl x509 -in "user1_cert.pem" -noout -fingerprint -sha256 | cut -d "=" -f 2 | sed 's/://g' | awk '{print tolower($0)}')
account_type0='current_account'
account_type1='savings_account'

echo "create accounts"
curl https://ccf_service_url/app/account/$user0_id/$account_type0 -X PUT --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem
curl https://ccf_service_url/app/account/$user1_id/$account_type1 -X PUT --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem

echo "deposit and display balance for account0"
curl https://ccf_service_url/app/deposit/$user0_id/$account_type0 -X POST --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem -H "Content-Type: application/json" --data-binary '{ "value": 100 }'
curl https://ccf_service_url/app/balance/$account_type0 -X GET --cacert service_cert.pem --cert user0_cert.pem --key user0_privk.pem

echo "deposit and display balance for account1"
curl https://ccf_service_url/app/deposit/$user1_id/$account_type1 -X POST --cacert service_cert.pem --cert member0_cert.pem --key member0_privk.pem -H "Content-Type: application/json" --data-binary '{ "value": 2000 }'
curl https://ccf_service_url/app/balance/$account_type1 -X GET --cacert service_cert.pem --cert user1_cert.pem --key user1_privk.pem

echo "Transfer 40 from user0 to user1"
transfer_transaction_id=$(curl https://ccf_service_url/app/transfer/$account_type0 -X POST -i --cacert service_cert.pem --cert user0_cert.pem --key user0_privk.pem -H "Content-Type: application/json" --data-binary "{ \"value\": 40, \"user_id_to\": \"$user1_id\", \"account_name_to\": \"$account_type1\" }" | grep -i x-ms-ccf-transaction-id | awk '{print $2}' | sed -e 's/\r//g')
echo "transaction ID of the transfer: $transfer_transaction_id"

echo "Display receipt"
curl https://ccf_service_url/app/receipt?transaction_id=$transfer_transaction_id --cacert service_cert.pem --key user0_privk.pem --cert user0_cert.pem

echo "Display balance"
curl https://ccf_service_url/app/balance/$account_type0 -X GET --cacert service_cert.pem --cert user0_cert.pem --key user0_privk.pem
curl https://ccf_service_url/app/balance/$account_type1 -X GET --cacert service_cert.pem --cert user1_cert.pem --key user1_privk.pem
```
---
## <img src="https://user-images.githubusercontent.com/42961061/191275172-24269bf0-bb9c-402d-8900-2d589582a781.png" height=50px></img> C++ Applications 

CCF apps can also be written in C++. This offers better performance than JavaScript apps but requires a compilation step and a restart of the CCF node for deployment.

The C++ sample app is located in the [`cpp/`](cpp/) directory.

Also check out the [code tour](#code-tour) to get an overview of the C++ app.

### Build C++ app

In the checkout of this repository:

```bash
cd cpp/
mkdir build && cd build
CC="/opt/oe_lvi/clang-10" CXX="/opt/oe_lvi/clang++-10" cmake -GNinja ..
ninja
ls

#libccf_app.enclave.so.signed # SGX-enabled application
#libccf_app.virtual.so # Virtual application (i.e. insecure!)
```

See [docs](https://microsoft.github.io/CCF/main/build_apps) for complete instructions on how to build a CCF app.

### Testing: Using Sandbox.sh

```bash
/opt/ccf/bin/sandbox.sh -p ./libccf_app.virtual.so
...
[12:00:00.000] Press Ctrl+C to shutdown the network
# It is then possible to interact with the service
```

Or, for an SGX-enabled application (unavailable in development container): `$ /opt/ccf/bin/sandbox.sh -p ./libccf_app.enclave.so.signed -e release`

### Testing: Using docker containers

It is possible to build a runtime image of the C++ application via docker:

```bash
docker build -t ccf-app-template:cpp-enclave -f docker/ccf_app_cpp.enclave .
docker run --device /dev/sgx_enclave:/dev/sgx_enclave --device /dev/sgx_provision:/dev/sgx_provision -v /dev/sgx:/dev/sgx ccf-app-template:cpp-enclave
...
2022-01-01T12:00:00.000000Z -0.000 0   [info ] ../src/node/node_state.h:1790        | Network TLS connections now accepted
# It is then possible to interact with the service
```

Or, for the non-SGX (a.k.a. virtual) variant:

```bash
docker build -t ccf-app-template:cpp-virtual -f docker/ccf_app_cpp.virtual .
docker run ccf-app-template:virtual
```
---

# Network Governance
a Consortium of trusted Members [governs the CCF network](https://microsoft.github.io/CCF/main/governance/index.html). members can submit proposals to CCF and these proposals are accepted based on the rules defined in the [Constitution](https://microsoft.github.io/CCF/main/governance/constitution.html).
Governance changes are submitted to a [network as Proposals](https://microsoft.github.io/CCF/main/governance/proposals.html), and put to a vote from members.

Submit a proposal 
```bash
proposal0_out=$(/opt/ccf/bin/scurl.sh "https://ccf_service_url/gov/proposals" --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --data-binary @proposal.json -H "content-type: application/json")
proposal0_id=$( jq -r  '.proposal_id' <<< "${proposal0_out}" )
```

Members vote to accept or reject the proposal
```bash
/opt/ccf/bin/scurl.sh "https://ccf_service_url/gov/proposals/$proposal0_id/ballots" --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --data-binary @vote_accept.json -H "content-type: application/json" | jq
/opt/ccf/bin/scurl.sh "https://ccf_service_url/gov/proposals/$proposal0_id/ballots" --cacert service_cert.pem --signing-key member1_privk.pem --signing-cert member1_cert.pem --data-binary @vote_accept.json -H "content-type: application/json" | jq
```
 
## Network Governance: Activating network members 

By default the CCF network needs at least one member to be started, after the network is started this member must be activated.
[Adding or activating members](https://microsoft.github.io/CCF/main/governance/adding_member.html)

### Activate member
```bash
curl "https://ccf_service_url/gov/ack/update_state_digest" -X POST --cacert service_cert.pem --key member0_privk.pem --cert member0_cert.pem --silent | jq > request.json
cat request.json
/opt/ccf/bin/scurl.sh "https://ccf_service_url/gov/ack"  --cacert service_cert.pem --signing-key member0_privk.pem --signing-cert member0_cert.pem --header "Content-Type: application/json" --data-binary @request.json
```

### New member proposal
```json
{
  "actions": [
    {
        "name": "set_member",
        "args": {
            "cert": "member_cert",
            "encryption_pub_key": "member_encryption_pub_key"
        }
    }
  ]
}
```

## Network Governance: Adding users 
Users are directly interact with the application running in CCF. Their public identity should be voted in by members before they are allowed to issue requests.

Once a CCF network is successfully started and an acceptable number of nodes have joined, members should vote to open the network to Users. 
First, the identities of trusted users should be generated,see [Generating Member Keys and Certificates](https://microsoft.github.io/CCF/main/governance/adding_member.html#generating-member-keys-and-certificates) and [Adding Users docs](https://microsoft.github.io/CCF/main/governance/open_network.html)

### New user proposal
```json
{
  "actions": [
    {
        "name": "set_user",
        "args": {
            "cert": "user_cert"
        }
    }
  ]
}
```

## Network Governance: Application deployment
The native format for JavaScript applications in CCF is a [JavaScript application bundle](https://microsoft.github.io/CCF/main/build_apps/js_app_bundle.html), or short app bundle. A bundle can be wrapped directly into a governance proposal for deployment.

### Application deployment proposal

```json
{
  "actions": [
    {
      "name": "set_js_app",
      "args": {
        "bundle": {
          "metadata": { "endpoints": {} },
          "modules": []
        }
      }
    }
  ]
}
```

## Network Governance: Open network for users
Once users are added to the opening network, members should create a proposal to open the network,
Other members are then able to vote for the proposal using the returned proposal id.

Once the proposal has received enough votes under the rules of the Constitution (ie. ballots which evaluate to true), the network is opened to users. 
It is only then that users are able to execute transactions on the deployed application.

### Open network proposal
```json
{
  "actions": [
    {
        "name": "transition_service_to_open",
        "args": {
            "next_service_identity": "service_cert"
        }
    }
  ]
}
```
---
# Development Dependencies Installation

- CCF Setup
- NodeJS
- NPM

## CCF Install
To install the ccf runtime please check [Install CCF](https://microsoft.github.io/CCF/main/build_apps/install_bin.html)

```bash
#!/bin/bash

echo "Install CCF" 

echo "Clone CCF Repo to be used in the Prerequisites Installation"
cd ~/repos
git clone https://github.com/microsoft/CCF.git

echo "Install CCF Prerequisites"
cd CCF/getting_started/setup_vm
./run.sh app-run.yml # Install Prerequisites

echo "Install CCF"
export CCF_VERSION=$(curl -ILs -o /dev/null -w %{url_effective} https://github.com/microsoft/CCF/releases/latest | sed 's/^.*ccf-//')
wget https://github.com/microsoft/CCF/releases/download/ccf-${CCF_VERSION}/ccf_${CCF_VERSION}_amd64.deb
sudo apt install ./ccf_${CCF_VERSION}_amd64.deb

echo "Verify the installation"
/opt/ccf/bin/cchost --version
```

