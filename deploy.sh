#!/bin/bash

user=$1
USER_INTERN="hbv-kms"
DIR="NodeJS_Server4Pepper"
HOST="hopper.hs-bremerhaven.de"
ssh -p443 $user@$HOST "sudo -su hbv-kms hbv_dockeraktivieren && logout" && logout 
cd .. && tar -cvf - $DIR | ssh -p443 $user@$HOST "sudo -su hbv-kms ssh mydocker 'tar -C /home/docker-hbv-kms -xf - && cd /home/docker-hbv-kms/$DIR && npm run prod'"