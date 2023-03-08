#!/usr/bin/env bash
DIR="$(cd `dirname $0`; pwd)"
cd $DIR

escape(){
    escape=`echo $1 | sed -e "s/\\//\\\\\\\\\\//g" -e "s/\\&/\\\\\\\\\\&/g"`
}

if [ $# -lt 1 ]
then
    PORT=443
else
    PORT=$1
fi
if [ $# -lt 2 ]
then
    SOCKET=8000
else
    SOCKET=$2
fi
if [ $# -lt 3 ]
then
    INTERNAL=8001
else
    INTERNAL=$3
fi
if [ $# -lt 4 ]
then
    DOMAIN=localhost
else
    DOMAIN=$4
fi

escape $DIR
EDIR=$escape

escape $PORT
EPORT=$escape

escape $SOCKET
ESOCKET=$escape

escape $INTERNAL
EINTERNAL=$escape

escape $DOMAIN
EDOMAIN=$escape

sed -e "s/\$DIR/$EDIR/g" -e "s/\$PORT/$EPORT/g" -e "s/\$SOCKET/$ESOCKET/g" -e "s/\$INTERNAL/$EINTERNAL/g" -e "s/\$DOMAIN/$EDOMAIN/g" ./nginx/template.nginx.conf >./nginx/nginx.conf
sed -e "s/\$DIR/$EDIR/g" -e "s/\$PORT/$EPORT/g" -e "s/\$SOCKET/$ESOCKET/g" -e "s/\$INTERNAL/$EINTERNAL/g" -e "s/\$DOMAIN/$EDOMAIN/g" ./uwsgi/template.uwsgi.ini >./uwsgi/uwsgi.ini

pip install --upgrade pip
pip install -r requirements.txt

cd ./frontend/
bash build.sh
cd ..

cd ./scripts/
bash crontab.sh
cd ..

bash kill-port.sh $PORT $SOCKET $INTERNAL 80
bash migrate.sh
python createsuperuser.py
nohup uwsgi --ini "$DIR/uwsgi/uwsgi.ini"
chmod -R a+rwx /usr/local/nginx/client_body_temp
chown -R root:root /usr/local/nginx/client_body_temp
bash nginx.sh
