#!/bin/bash

cd fast-geocode

echo '-- getting missing dates --'
python 0-get-dates.py --config ../config.json --outfile missing_days.txt

echo '-- geocoding --'
cat missing_days.txt | parallel -u --progress --pipe \
    "python fast-geocode.py --db ../data/lookup.db --config ../config.json"