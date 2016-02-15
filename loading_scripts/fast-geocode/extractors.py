import re
from flatten import flatten

def clean_string(string):
    string = re.sub(' +', '_', string)
    string = re.sub(r'[^\w]', '', string)
    return string.lower()


def make_locus(x, locus_nms):
    return '__'.join([clean_string(x[n]) for n in locus_nms if x.get(n, False)])


def s_lower(x):
    return x.lower() if x else None


def subject_l(x):
    if 'SUBJECTS' in x:
        
        if isinstance(x['SUBJECTS'], dict):
            x['SUBJECTS'] = [x['SUBJECTS']]
        
        adds = [a['subject_address'] for a in x['SUBJECTS']]
        adds = filter(lambda x: x != (), adds)
        adds = flatten(adds)
        
        return map(lambda sub: {
            "locus_actor" : 'subject',
            "resolution"  : 'city',
            "city"        : s_lower(sub["city"]),
            "state"       : s_lower(sub["state"]),
            "country"     : s_lower(sub["country_code"])
        }, adds)
    else:
        return []


def branch_l(x):
    if 'FIN_INST' in x:
        
        if isinstance(x['FIN_INST'], dict):
            x['FIN_INST'] = [x['FIN_INST']]
        
        adds = [a['branch'] for a in  x['FIN_INST']]
        adds = filter(lambda x: x != (), adds)
        adds = flatten(adds)
        
        return map(lambda sub: {
            "locus_actor" : 'fin_inst_branch',
            "resolution"  : 'city',
            "city"        : s_lower(sub["city"]),
            "state"       : s_lower(sub["state"]),
            "country"     : s_lower(sub["country_code"])
        }, adds)
    else:
        return []


def gen_l(x, name, field, city, state, country):
    if field in x:
        return map(lambda sub: {
            "locus_actor" : name,
            "resolution"  : "city",
            "city"        : s_lower(sub[city]),
            "state"       : s_lower(sub[state]),
            "country"     : s_lower(sub[country])
        }, flatten([x[field]]))
    else:
        return []    


def extract_locations(x):
    locations = flatten([
        subject_l(x),
        branch_l(x),
        gen_l(x, 'fil_inst', 'FIL_INST', 'city', 'state', 'country_code'),
        gen_l(x, 'fin_inst', 'FIN_INST', 'city', 'state', 'country')
    ])
    
    for l in locations:
         l.update({'locus' : make_locus(l, ['city', 'state', 'country'])})
    
    return filter(lambda x: x['locus'] != '', locations)
