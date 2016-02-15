'''
    Method stolen from funcy package
'''

from collections import Mapping, Set, Sequence, Iterator, Iterable

def isa(*types):
    return lambda x: isinstance(x, types)

is_seqcont = isa(list, tuple, Iterator, xrange)

def iflatten(seq, follow=is_seqcont):
    for item in seq:
        if follow(item):
            for sub in iflatten(item, follow):
                yield sub
        else:
            yield item


def flatten(seq, follow=is_seqcont):
    return list(iflatten(seq, follow))
