import re
import json
import argparse
import itertools
import sqlite3

# --
# CLI

parser = argparse.ArgumentParser()
parser.add_argument('--infile', dest = 'infile', required = True)
parser.add_argument('--outfile', dest = 'outfile', required = True)
args = parser.parse_args()

# --
# Helpers

def clean_string(string):
    string = re.sub(' +', '_', string)
    string = re.sub(r'[^\w]', '', string)
    return string.lower()


def enumerate_place_names(data):
    for i, y in enumerate(data):
        for name in set(y['alternatenames'] + [y['name'], y['asciiname']]):
            if name != '':
                for country in set([y['country_code'], y.get('fips', None)]):
                    if country:
                        if country == 'US':
                            tmp = [name, y['admin1_code'], country]
                        else:    
                            tmp = [name, country]
                        
                        yield (
                            '__'.join(map(clean_string, tmp)),     # locus
                            y['geonameid'],                        # geonameid
                            tmp[0] in [y['name'], y['asciiname']], # primary name
                            y['population']                        # give precedence
                        )


def clean_data(d):
    return {
        "id"      : d['geonameid'],
        "score"   : 999,
        "country" : d['country_code'],
        "fips"    : d.get('fips', None),
        "city"    : d['asciiname'],
        "state"   : d['admin1_code'],
        "exact"   : True,
        "loc" : {
            "lon" : d['longitude'],
            "lat" : d['latitude']
        }
    }

def do_rank(x):
    # Stub, but eventually will delete all but the "best match"
    # where "best match" is defined by 
    #   - ascii vs alternate
    #   - population
    
    return x

# --
# Run

# --
# Creating database
conn = sqlite3.connect(args.outfile)
_ = conn.execute('CREATE TABLE us_ids (key, obj)')
_ = conn.execute('CREATE TABLE inter_ids (key, obj)')
_ = conn.execute('CREATE TABLE lookup (key, obj)')

# --
print '-- loading data --'
orig_data = [json.loads(x) for x in open(args.infile)]

# --
print '-- parsing US --'
us     = filter(lambda x: x['country_code'].lower() == 'us', orig_data)
us     = list(enumerate_place_names(us))

us_grp = itertools.groupby(us, key = lambda x: x[0])
us_grp = [(k, list([vv[1:] for vv in v])) for k,v in us_grp]
us_grp = map(lambda x: (x[0], json.dumps(do_rank(x[1]))), us_grp)

print '-- storing US database --'
conn.executemany('INSERT INTO us_ids VALUES (?, ?)', us_grp)
conn.execute('CREATE INDEX us_key_index ON us_ids (key)')
conn.commit()

del us
del us_grp

# --
print '-- parsing international --'
inter = filter(lambda x: x['country_code'].lower() != 'us', orig_data)
inter = list(enumerate_place_names(inter))

inter_grp = itertools.groupby(inter, key = lambda x: x[0])
inter_grp = [(k, list([vv[1:] for vv in v])) for k,v in inter_grp]
inter_grp = map(lambda x: (x[0], json.dumps(do_rank(x[1]))), inter_grp)

print '-- storing inter database --'
conn.executemany('INSERT INTO inter_ids VALUES (?, ?)', inter_grp)
conn.execute('CREATE INDEX inter_key_index ON inter_ids (key)')
conn.commit()

del inter
del inter_grp

# --
print '-- creating mapping from geonameid to data --'
lookup = map(clean_data, orig_data)
del orig_data
lookup = filter(lambda x: x.has_key('id'), lookup)
lookup = [(str(l['id']), json.dumps(l)) for l in lookup]

print '-- storing geonameid database --'
_ = conn.executemany('INSERT INTO lookup VALUES (?, ?)', lookup)
_ = conn.execute('CREATE INDEX lookup_key_index ON lookup (key)')

# --
conn.commit()
conn.close()