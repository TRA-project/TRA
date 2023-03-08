#!/bin/bash
BRANCH=`git branch | grep "*" | awk '{print $2}'`
ORIGIN=`git branch -a | grep "remotes" | sed -n "1p" | awk -F/ '{print $2}'`
if [ $# -lt 1 ]
then
 COMMENT="update"
else
 COMMENT=$1
fi
git pull "$ORIGIN" "$BRANCH" && git add . && git commit -m "$COMMENT" && git push --set-upstream "$ORIGIN" "$BRANCH"
