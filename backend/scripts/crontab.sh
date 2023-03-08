#!/usr/bin/env bash
DIR="$(cd `dirname $0`; pwd)"
cd $DIR

if [ $# -lt 1 ]
then
    USER=root
else
    USER=$1
fi

var_escape(){
    var_escape=`echo "$2" | sed -e "s/\\//\\\\\\\\\\//g" -e "s/\\&/\\\\\\\\\\&/g"`
    var_escape=`echo "$3" | sed -e "s/\\\$$1/$var_escape/g"`
}

cat "$DIR/crontab.txt" | while read cron
do
    var_escape "DIR" "$DIR" "$cron"
    cron=$var_escape
    if [ -z "$(cat "/var/spool/cron/$USER" | grep -Fx "$cron")" ]
    then
        echo "$cron" >> "/var/spool/cron/$USER"
    fi
done;
