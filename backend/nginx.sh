#!/usr/bin/env bash
if [ -e "/usr/local/nginx/conf/nginx.conf" ]
then
    \rm -rf ./nginx/nginx.conf.bak
    \mv -f /usr/local/nginx/conf/nginx.conf ./nginx/nginx.conf.bak
fi
\cp -rf ./cert/* /usr/local/nginx/conf/
\cp -rf ./nginx/nginx.conf /usr/local/nginx/conf/
nginx
