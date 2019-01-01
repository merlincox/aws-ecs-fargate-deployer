#!/bin/bash

cd "$(dirname "$0")"

docker build -t my-app .
docker run -p 80:3000 my-app
