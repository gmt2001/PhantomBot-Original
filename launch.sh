#!/bin/bash

cd $(dirname $(readlink -f $0))

java -Dbot=template -Dfile.encoding=UTF-8 -jar PhantomBot.jar 1>/dev/null 2>/dev/null &
