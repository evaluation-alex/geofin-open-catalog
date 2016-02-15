import json
import argparse
from datetime import datetime, timedelta
from elasticsearch import Elasticsearch

# --
# CLI
parser = argparse.ArgumentParser()
parser.add_argument('--outfile', dest = 'outfile', required = False, default = 'missing_days.txt')
parser.add_argument('--config', dest = 'config', required = True)
args = parser.parse_args()

config  = json.load(open(args.config))
client  = Elasticsearch(config['ELASTICSEARCH']['IP'], timeout = 30)

# --
print '-- running query --'
res = client.search(
    index       = config["ELASTICSEARCH"]["INDEX"]["DATA"],
    search_type = "count",
    body  = {
        "query" : {
            "filtered" : {
                "filter" : {
                    "missing" : {
                        "field" : config['indicator']
                    }
                }
            }
        },
        "aggs" : {
            "date_histogram" : {
                "date_histogram" : {
                    "field"    : config["FIELDS"]["DATE"],
                    "interval" : "day"
                }
            }
        }
    }
)

# --
print '-- saving --'
days = [b['key_as_string'].split('T')[0] for b in res['aggregations']['date_histogram']['buckets']]
open(args.outfile, 'w').write('\n'.join(days))