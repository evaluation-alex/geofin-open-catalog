import sys
import json
import argparse
import sqlite3
from datetime import datetime
from elasticsearch import Elasticsearch
from elasticsearch.helpers import streaming_bulk, scan
from datetime import datetime, timedelta

from extractors import *

# TODO : Check capitalization in `gfloc`

# --
# CLI

VERBOSE = True

parser = argparse.ArgumentParser()
parser.add_argument('--db', dest = 'db', required = True)
parser.add_argument('--config', dest = 'config', required = True)
args = parser.parse_args()

conn   = sqlite3.connect(args.db)
config = json.load(open(args.config))

def get_record(conn, mid):
    cmd = 'SELECT obj from lookup WHERE key = "%s"' % str(mid)
    tmp = conn.execute(cmd).fetchone()
    if tmp:
        return json.loads(tmp[0])

# --
# Functions
def add_best(conn, x):
    global lookup
    
    cmd = 'SELECT obj FROM %s_ids WHERE key == "%s"' % (
        'us' if x['country'] == 'us' else 'inter', 
        x['locus']
    )
    tmp = conn.execute(cmd).fetchone()
    
    if tmp:
        mid = json.loads(tmp[0])[0][0]
        x['best'] = get_record(conn, mid)
    
    return x

# --
# Run

def run_date(date, index = config['ELASTICSEARCH']['INDEX']['DATA']):
    query = {
        "_source" : ["DETAILS", "SUBJECTS", "FIN_INST", "FIL_INST"],
        "query" : {
            "filtered" : {
                "query" : {
                    "match" : {
                        "DETAILS.date_filed" : date
                    }
                },
                "filter" : {
                    "missing" : {
                        "field" : config['indicator']
                    }
                }
            }
        }
    }
    
    for a in scan(client, index = index, query = query):
        if VERBOSE:
            print 'tagging %s' % str(a['_id'])
        
        doc = {
            "gfloc_testing"      : [add_best(conn, el) for el in extract_locations(a["_source"])],
            "gfloc_meta_testing" : {
                "timestamp" : datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
            }
        }
        
        doc[config['indicator']] = True
        
        yield {
            "_index"   : index,
            "_type"    : a["_type"],
            "_id"      : a["_id"],
            "_op_type" : "update",
            "doc"      : doc
        }

# --
# Run

client = Elasticsearch(config['ELASTICSEARCH']['IP'], timeout = 60)

for d in sys.stdin:
    d = d.strip()
    print '-- loading :: %s --' % d
    for a,b in streaming_bulk(client, run_date(d), chunk_size = 1000):
        if VERBOSE:
            print a,b
