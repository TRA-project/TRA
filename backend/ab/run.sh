#!/usr/bin/env bash
DIR="$(cd `dirname $0`; pwd)"
cd $DIR

bash ab_schedule.sh res.csv <"schedule.txt"
