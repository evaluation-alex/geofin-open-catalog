import sys
import json

remove = ['cc2', 'dem', 'elevation', 'modification_date', 'timezone']

for entry in sys.stdin:
    tmp = json.loads(entry)

    for r in remove:
        del tmp[r]
    
    print json.dumps(tmp)