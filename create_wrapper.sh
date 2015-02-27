#!/bin/bash

cd $(dirname $(readlink -f $0))

if [ $# -lt 1 ]; then
    echo Usage: ./create_wrapper.sh SERVICENAME
    exit 1
fi

sed -e "s/\[botname\]/$1/g" wrapper.c > wrapper_s.c

gcc -std=c99 wrapper_s.c -o svcctrl

chown root svcctrl
chmod 6755 svcctrl

rm -f wrapper_s.c
