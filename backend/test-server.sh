#!/usr/bin/env bash
DIR="$(cd `dirname $0`; pwd)"
cd $DIR

PORT=$1
if [ -n "$PORT" ]
then
    PORT=8100
fi

python "manage.py" makemigrations adminsystem app
python "manage.py" migrate
python "manage.py" runserver $PORT
