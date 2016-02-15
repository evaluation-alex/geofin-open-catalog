#!/bin/bash

echo '-- subsetting to A + P --'
cat data/geonames.json | grep -E '"feature_class": "A|P"' > data/geonames_ap.json

echo '-- deleting unnecessary fields --'
cat data/geonames_ap.json | parallel --pipe "python clean.py" > data/geonames_ap_clean.json

echo '-- storing in SQL database for OOM lookup --'
rm data/lookup.db
python make-lookup.py --infile data/geonames_ap_clean.json --outfile data/lookup.db

echo '-- done --'