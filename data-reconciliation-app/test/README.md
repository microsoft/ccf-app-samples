# Testing Strategy

This outlines how the Data Reconciliation application is tested.

## Overview

There are 3 different types of network that this sample can be tested against; Sandbox, Docker, and Managed CCF. The script [./test.sh](./test.sh) is specific to this sample and is called by wrapper scripts that exist in the root [scripts](../../scripts/) folder. These wrapper scripts are used for all samples.

| Network | Command | Script |
| ------: | -----: | ------: |
| Sandbox |  `make test` | [test_sandbox](../../scripts/test_sandbox.sh) |
| Docker | `make test-docker-virtual` and `make test-docker-enclave` | [test_docker](../../scripts/test_docker.sh) |
| Managed CCF | `make test-mccf` | [test_mccf](../../scripts/test_docker.sh) |

The wrapper scripts are responsible for starting the particular network with the correct constitution and setting up the governance (users/members/application). The wrapper scripts will also close the network after the tests have finished (excluding mCCF).

## Demo

It is also possible to run the tests in *Demo mode*. This can be achieved by runing
```bash
cd data-reconciliation-app && make demo
```
There is a [guide](../docs/demo-guidance.md) here explaining what the demo shows.
