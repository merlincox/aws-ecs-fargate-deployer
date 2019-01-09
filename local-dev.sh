#!/usr/bin/env bash

set -e

cd "$(dirname "$0")"

npm run build-dev
npm run copy-files


export ECS_PORT=2000
export ECS_PLATFORM=test
export ECS_ARBITRARY="Fish & Chips"

node run.js
