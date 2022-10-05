# CCF App Template [![Open in VSCode](https://img.shields.io/static/v1?label=Open+in&message=VSCode&logo=visualstudiocode&color=007ACC&logoColor=007ACC&labelColor=2C2C32)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/microsoft/ccf-app-template)

[![CCF App Template CI](https://github.com/microsoft/ccf-app-template/actions/workflows/ci.yml/badge.svg)](https://github.com/microsoft/ccf-app-template/actions/workflows/ci.yml)

Template repository for JavaScript and C++ CCF applications.

## Quickstart

The quickest way to build and run this sample CCF app is to checkout this repository locally in its development container by clicking: 
[![Open in VSCode](https://img.shields.io/static/v1?label=Open+in&message=VSCode&logo=visualstudiocode&color=007ACC&logoColor=007ACC&labelColor=2C2C32)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/microsoft/ccf-app-template)

All dependencies will be automatically installed (takes ~2 mins on first checkout).

Alternatively, if your organisation supports it, you can checkout this repository in a Github codespace: [![Open in Github codespace](https://img.shields.io/static/v1?label=Open+in&message=GitHub+codespace&logo=github&color=2F363D&logoColor=white&labelColor=2C2C32)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=496290904&machine=basicLinux32gb&devcontainer_path=.devcontainer.json&location=WestEurope)

## <img src="https://user-images.githubusercontent.com/42961061/191275583-88e00f94-73aa-4d66-9786-047987eb9fa9.png" height=50px> </img> JavaScript

CCF apps can be written in JavaScript/TypeScript. This is the quickest way to develop new apps as this does not require any compilation step and the app can be updated on the fly, via [a governance proposal](https://microsoft.github.io/CCF/main/build_apps/js_app_bundle.html#deployment).

The JavaScript sample bundle is located in the [`js/`](js/) directory.

### Run JS app

```bash
$ /opt/ccf/bin/sandbox.sh --js-app-bundle ./js/
[12:00:00.000] Virtual mode enabled
[12:00:00.000] Starting 1 CCF node...
[12:00:00.000] Started CCF network with the following nodes:
[12:00:00.000]   Node [0] = https://127.0.0.1:8000
[12:00:00.000] You can now issue business transactions to the libjs_generic application
[12:00:00.000] Loaded JS application: ./js/
[12:00:00.000] Keys and certificates have been copied to the common folder: .../ccf-app-template/workspace/sandbox_common
[12:00:00.000] See https://microsoft.github.io/CCF/main/use_apps/issue_commands.html for more information
[12:00:00.000] Press Ctrl+C to shutdown the network
```

In another terminal:

```bash
$ curl -X POST https://127.0.0.1:8000/app/log?id=1 --cacert ./workspace/sandbox_common/service_cert.pem -H "Content-Type: application/json" --data '{"msg": "hello world"}'
$ curl https://127.0.0.1:8000/app/log?id=1 --cacert ./workspace/sandbox_common/service_cert.pem
hello world
```

### Docker

It is possible to build a runtime image of the JavaScript application via docker:

```bash
$ docker build -t ccf-app-template:js-enclave -f docker/ccf_app_js.enclave .
$ docker run --device /dev/sgx_enclave:/dev/sgx_enclave --device /dev/sgx_provision:/dev/sgx_provision -v /dev/sgx:/dev/sgx ccf-app-template:js-enclave
...
2022-01-01T12:00:00.000000Z -0.000 0   [info ] ../src/node/node_state.h:1790        | Network TLS connections now accepted
# It is then possible to interact with the service
```

Or, for the non-SGX (a.k.a. virtual) variant:

```bash
$ docker build -t ccf-app-template:js-virtual -f docker/ccf_app_js.virtual .
$ docker run ccf-app-template:virtual
```

## <img src="https://user-images.githubusercontent.com/42961061/191275172-24269bf0-bb9c-402d-8900-2d589582a781.png" height=50px></img> C++ 

CCF apps can also be written in C++. This offers better performance than JavaScript apps but requires a compilation step and a restart of the CCF node for deployment.

The C++ sample app is located in the [`cpp/`](cpp/) directory.

Also check out the [code tour](#code-tour) to get an overview of the C++ app.

### Build C++ app

In the checkout of this repository:

```bash
$ cd cpp/
$ mkdir build && cd build
$ CC="/opt/oe_lvi/clang-10" CXX="/opt/oe_lvi/clang++-10" cmake -GNinja ..
$ ninja
$ ls
libccf_app.enclave.so.signed # SGX-enabled application
libccf_app.virtual.so # Virtual application (i.e. insecure!)
```

See [docs](https://microsoft.github.io/CCF/main/build_apps) for complete instructions on how to build a CCF app.

### Run C++ app

```bash
$ /opt/ccf/bin/sandbox.sh -p ./libccf_app.virtual.so
Setting up Python environment...
Python environment successfully setup
[12:00:00.000] Virtual mode enabled
[12:00:00.000] Starting 1 CCF node...
[12:00:00.000] Started CCF network with the following nodes:
[12:00:00.000]   Node [0] = https://127.0.0.1:8000
[12:00:00.000] You can now issue business transactions to the ./libccf_app.virtual.so application
[12:00:00.000] Keys and certificates have been copied to the common folder: .../ccf-app-template/build/workspace/sandbox_common
[12:00:00.000] See https://microsoft.github.io/CCF/main/use_apps/issue_commands.html for more information
[12:00:00.000] Press Ctrl+C to shutdown the network
```

Or, for an SGX-enabled application (unavailable in development container): `$ /opt/ccf/bin/sandbox.sh -p ./libccf_app.enclave.so.signed -e release`

### Docker

It is possible to build a runtime image of the C++ application via docker:

```bash
$ docker build -t ccf-app-template:cpp-enclave -f docker/ccf_app_cpp.enclave .
$ docker run --device /dev/sgx_enclave:/dev/sgx_enclave --device /dev/sgx_provision:/dev/sgx_provision -v /dev/sgx:/dev/sgx ccf-app-template:cpp-enclave
...
2022-01-01T12:00:00.000000Z -0.000 0   [info ] ../src/node/node_state.h:1790        | Network TLS connections now accepted
# It is then possible to interact with the service
```

Or, for the non-SGX (a.k.a. virtual) variant:

```bash
$ docker build -t ccf-app-template:cpp-virtual -f docker/ccf_app_cpp.virtual .
$ docker run ccf-app-template:virtual
```

---

## TS
```bash
# Install nvm
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
# Then follow the instruction in the output

# Use v16.17.0 as default
$ nvm install v16.17.0

# Build TS project
$ cd ts
$ npm i
$ npm run build

# Run the app
$ /opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/
```

## banking-app

### How to run the demo

```bash
$ cd banking-app
$ npm i # Necessary only for the first time
$ ./prepare_demo.sh

# In another terminal
$ cd banking-app
$ ./demo.sh
$ ./show_app_log.sh # You can see the application log
```

### How to run test
```bash
$ cd banking-app
$ npm i # Necessary only for the first time
$ ./test.sh
```

## Dependencies

If this repository is checked out on a bare VM (e.g. [for SGX deployments](https://docs.microsoft.com/en-us/azure/confidential-computing/quick-create-portal)), the dependencies required to build and run the C++ app can be installed as follows:

```bash
$ wget https://github.com/microsoft/CCF/releases/download/ccf-2.0.0/ccf_2.0.7_amd64.deb
$ sudo dpkg -i ccf_2.0.7_amd64.deb # Install CCF under /opt/ccf
$ cat /opt/ccf/share/VERSION_LONG
ccf-2.0.7
$ /opt/ccf/getting_started/setup_vm/run.sh /opt/ccf/getting_started/setup_vm/app-dev.yml # Install dependencies
```

See the [CCF official docs](https://microsoft.github.io/CCF/main/build_apps/install_bin.html#install-ccf) for more info.

## Code Tour

In VSCode, a [code tour](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.codetour) of the C++ app can be started with: Ctrl + P, `> CodeTour: Start Tour`

# Project

> This repo has been populated by an initial template to help get you started. Please
> make sure to update the content to build a great experience for community-building.

As the maintainer of this project, please make a few updates:

- Improving this README.MD file to provide a great experience
- Updating SUPPORT.MD with content about this project's support experience
- Understanding the security reporting process in SECURITY.MD
- Remove this section from the README

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
