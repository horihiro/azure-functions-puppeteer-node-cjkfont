#!/bin/sh

curl -s "https://noto-website-2.storage.googleapis.com/pkgs/NotoSansCJKjp-hinted.zip" -o /tmp/fonts.zip && \
unzip -o /tmp/fonts.zip -d /tmp/fonts/ && \
mkdir -p ./fonts && mv /tmp/fonts/*.otf ./fonts