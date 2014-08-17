#!/bin/bash
set -e
bash which yo || npm install -g yo
bash which istanbul || npm install -g istanbul
echo "prepublish executed sucessfully"