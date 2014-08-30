#!/bin/bash
set -e
bash which yo || npm install -g yo
bash which istanbul || npm install -g istanbul
bash which mocha || npm install -g mocha
bash which gulp || npm install -g gulp
bash which codeclimate || npm install -g codeclimate-test-reporter
echo "prepublish executed sucessfully"