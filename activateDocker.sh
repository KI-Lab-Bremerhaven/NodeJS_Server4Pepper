#!/bin/bash

user=$1
HOST="hopper.hs-bremerhaven.de"
ssh -p443 $user@$HOST "sudo -su hbv-kms hbv_dockeraktivieren && logout" && logout 
echo "Done!"