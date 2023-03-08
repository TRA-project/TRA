#!/usr/bin/env bash
DIR="$(cd `dirname $0`; pwd)"
cd $DIR

file=$1
shift

extract(){
    extract=`echo "$2" | grep "$1" | sed 's/[^0-9]*\([0-9.]\+\).*/\1/g'`
}

res=`bash ab.sh $@ <"$file"`

extract "Complete requests" "$res"
comp=$extract

extract "Failed requests" "$res"
fail=$extract

extract "Non-2xx responses" "$res"
non2xx=$extract

if [ -n "$non2xx" ]
then
    fail=$non2xx
else
    length=`echo "$res" | grep ", Length:" | sed 's/[^,]*,[^,]*, Length: \([0-9.]\+\).*/\1/g'`
    if [ -n "$length" ]
    then
        fail=`expr $fail - $length`
    fi
fi

suc=`awk "BEGIN{print 1-($fail/$comp)}"`
extract "Requests per second" "$res"
rps=$extract
echo -e "$res" >&2
echo "$suc,$rps"
