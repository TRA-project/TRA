#!/usr/bin/env bash
DIR="$(cd `dirname $0`; pwd)"
cd $DIR

if [ $# -lt 1 ]
then
    num=1000
else
    num=$1
fi

if [ $# -lt 2 ]
then
    workers=100
else
    workers=$2
fi

url=""
post=""
contenttype="-T 'application/json'"
headers=""

count=0
while read line
do
    if [ $count -eq 0 ]
    then
        url=$line
    elif [ $count -eq 1 ]
    then
        if [ "${line:0:4}" = "POST" ]
        then
            post="-p ${line:5}"
        elif [ "${line:0:3}" = "PUT" ]
        then
            post="-u ${line:4}"
        else
            post=""
        fi
    elif [ $count -eq 2 ]
    then
        if [ -n "$line" ]
        then
            contenttype="-T '$line'"
        fi
    else
        if [ -n "$line" ]
        then
            headers="${headers}-H '$line' "
        fi
    fi
    count=`expr $count + 1`
done;

echo -n "-s 120 -n $num -c $workers $post $contenttype $headers '$url'" | xargs ab
