#!/bin/bash

# Exit when any command fails
set -e

display_usage() { 
	echo "Lint checking script"
    echo -e "If no argument is passed, it runs with check mode\n"
	echo "Usage:"
    echo -e "$0 [-f | --fix]"
    echo -e "$0 -h | --help" 
    echo ""
}

MODE="check"

for i in "$@"
do
    if [ "$i" == "--fix" ] || [ "$i" == "-f" ]
    then
        MODE="fix"
    fi

    if [ "$i" == "--help" ] || [ "$i" == "-h" ]
    then
        display_usage
        exit 0
    fi
done

echo "-- TypeScript, JavaScript, Markdown, YAML and JSON format"
# Use same format as https://github.com/microsoft/CCF/blob/main/scripts/ci-checks.sh 
npm install --loglevel=error --no-save prettier 1>/dev/null
if [ "$MODE" == "fix" ]; then
    git ls-files | grep -e '\.ts$' -e '\.js$' -e '\.md$' -e '\.yaml$' -e '\.yml$' -e '\.json$' | xargs npx prettier --write
else
    git ls-files | grep -e '\.ts$' -e '\.js$' -e '\.md$' -e '\.yaml$' -e '\.yml$' -e '\.json$' | xargs npx prettier --check
fi
