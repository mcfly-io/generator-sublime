#!/bin/bash
set -e
bash which yo || npm install -g yo
bash which istanbul || npm install -g istanbul
bash which mocha || npm install -g mocha

echo "prepublish executed sucessfully"