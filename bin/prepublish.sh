#!/bin/bash
set -e
which istanbul || npm install -g istanbul
which mocha || npm install -g mocha
which gulp || npm install -g gulp
which codeclimate || npm install -g codeclimate-test-reporter
echo "prepublish executed sucessfully"