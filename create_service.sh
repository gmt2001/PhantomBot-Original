#!/bin/bash

cd $(dirname $(readlink -f $0))

if [ $# -lt 3 ]; then
    echo Usage: ./create_service.sh SERVICENAME BOTFOLDER BOTUSERNAME
    exit 1
fi

sed -e "s/\[botname\]/$1/g" -e "s/\[botfolder\]/$2/g" -e "s/\[botuser\]/$3/g" botservicectrl > $1

chmod 0755 $1

mv $1 /etc/init.d/$1

chkconfig --add $1