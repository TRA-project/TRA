#!/bin/bash
ROW=`nvidia-smi | grep -n Processes | awk -F: '{print $1}'`
nvidia-smi | sed -n "$ROW,\$p" | grep "MiB" | awk '{print $3}' | xargs kill -9
