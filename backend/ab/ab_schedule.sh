#!/usr/bin/env bash
DIR="$(cd `dirname $0`; pwd)"
cd $DIR

if [ $# -lt 1 ]
then
    file="res.csv"
else
    file=$1
fi

f(){
    f="$1,$2,$3"
}

\cp -rf "../db.sqlite3" "../db.sqlite3.ab.bak"

echo "testcase,total,workers,success_rate,rps" >"$file"
while read line
do
    res=`bash ab_postprocess.sh $line`
    f $line
    echo "$f,$res" >>"$file"
done;

\cp -rf "../db.sqlite3.ab.bak" "../db.sqlite3"
