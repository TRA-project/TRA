#!/usr/bin/env bash
DIR="$(cd `dirname $0`; pwd)"
cd $DIR
python "manage.py" makemigrations adminsystem app
python "manage.py" migrate
