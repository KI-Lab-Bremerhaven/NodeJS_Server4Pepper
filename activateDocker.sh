#!/bin/bash

user=$1
if [[ "" == "$1" ]] ; then
    echo "User not defined!"
    exit 1
else
    HOST="hopper.hs-bremerhaven.de"
    ssh -p443 $user@$HOST "sudo -su hbv-kms hbv_dockeraktivieren && logout"
    echo "Done!"
fi