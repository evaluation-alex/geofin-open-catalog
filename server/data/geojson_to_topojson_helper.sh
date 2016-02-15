#!/bin/bash

# This command converts a GeoJSON file to Topojson, which is compressed
# and I think lower resolution.

topojson world_borders.js -p --no-stitch-poles -o world_borders.topojson

# To be ingestable into Geofin, make sure that the format matches the existing
# files.
