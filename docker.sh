#!/bin/bash

cd "$(dirname "$0")"

docker build -t ssr-spa .
docker run -p 80:3000 ssr-spa
