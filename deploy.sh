#!/bin/bash

user=$1
DIR="NodeJS_Server4Pepper"
HOST="hopper.hs-bremerhaven.de"
bash activateDocker.sh $user
cd .. && tar -czvf - $DIR | ssh -p443 $user@$HOST "sudo -su hbv-kms ssh mydocker 'tar -C /home/docker-hbv-kms --recursive-unlink -xzvf - && cd /home/docker-hbv-kms/$DIR && npm run prod'"
echo "Done!"