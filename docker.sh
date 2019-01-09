#!/bin/bash

cd "$(dirname "$0")"

docker build -t ssr-spa-ecs .
docker run -p 80:3000 ssr-spa-ecs
