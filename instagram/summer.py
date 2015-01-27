#!/usr/bin/python2.7

import sys
import os

import pickle
import glob

def main(pickles_folder, limit, until = None):
    res = {}

    for pickle_file in glob.glob(os.path.join(pickles_folder, "*.pickle")):
        cur = pickle.load(file(pickle_file))
        print "retrieved %s items from pickle file '%s' (first: %s, last: %s)" % (len(cur), pickle_file, sorted(cur.keys())[0], sorted(cur.keys())[-1])
        res.update(cur)

    indexes = sorted(res.keys())
    first = indexes[0]
    last = indexes[-1]
    print "found a total of %s items (first: %s, last: %s)" % (len(indexes), first, last)
    indexes = set(indexes)
    expected = set(xrange(last + 1))
    diff = list(expected - indexes)
    #TODO: convert to ranges

    print "missing %d items" % len(diff),
    items = []
    if len(diff) > 0:
        start = diff[0]
        prev = diff[0]
        for index in diff[1:]:
            if index - prev != 1: 
                items.append((start, prev)) # inclusive
                start = index
            prev = index
        items.append((start, prev)) # inclusive
        items = sorted(items)

        print ":\n%s" % ",".join([start == finish and str(start) or "%d - %d" % (start, finish) for start, finish in items])

    print
    print "Results:"

    y = {}
    for i in res.values():
        y[int(i['data']['name'])] = i['data']['media_count']

    for i,v in y.items():
        if until != None and i <= until:
            if v <= limit and i <= until:
                print i,v



if __name__ == "__main__":

    if len(sys.argv) < 3:
        print "usage: %s <pickles_folder> <limit> [<until>]" % sys.argv[0]
        sys.exit(1)

    pickles_folder = sys.argv[1]
    limit = int(sys.argv[2])
    until = None

    if len(sys.argv) == 4:
        until = int(sys.argv[3])

    if not os.path.isdir(pickles_folder):
        print "%s is not a folder or doesn't exist" % pickles_folder
        sys.exit(1)

    main(pickles_folder, limit, until)

