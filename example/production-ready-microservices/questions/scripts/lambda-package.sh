#!/usr/bin/env bash

set -euo pipefail

function package_source() {
    cd ./dist
    find . -exec touch -t 202001010000 {} +
    zip -Xqr ./../package/source.zip ./*
    cd ..
}

function package_dependencies() {
    cd package
    rm -rf ./nodejs/node_modules/aws-sdk
    find . -exec touch -t 202001010000 {} +
    zip -Xqr layer.zip ./nodejs/*
    cd ..
}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd $DIR/..

rm -rf ./dist
rm -rf ./package

mkdir -p ./package/nodejs

yarn install && \
    yarn build && \
    yarn install --production --modules-folder ./package/nodejs/node_modules

package_source
package_dependencies

rm -rf ./package/nodejs