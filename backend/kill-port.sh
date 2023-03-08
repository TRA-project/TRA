#!/bin/bash
for arg in $@; do
 lsof -i:$arg | sed -n "2,\$p" | awk '{print $2}' | xargs kill -9
done
