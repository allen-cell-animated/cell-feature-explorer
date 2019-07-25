#!/usr/bin/env bash

##################################################################################
# Request cache invalidation for all objects in the CFE Cloudfront distribution #
##################################################################################

set -e

CFE_CLOUDFRONT_DISTRIBUTION_ID=E3S5ZMP0OVZ8R1

aws cloudfront create-invalidation --distribution-id ${CFE_CLOUDFRONT_DISTRIBUTION_ID} --paths "/*"
