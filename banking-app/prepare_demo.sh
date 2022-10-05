#!/bin/bash

# Hack to use default resolve.js
# It should be improved after '--no-default-constitution' is added to sandbox.sh.
# NOTE: This hack replaces the content of /opt/ccf/bin/resolve.js
cp constitutions/resolve.js /opt/ccf/bin/resolve.js

npm run build

# Run sandbox. Consider 3 members as 3 banks.
/opt/ccf/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 0
