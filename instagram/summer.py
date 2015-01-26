#!/usr/bin/python2.7

import sys
import os

import pickle
import glob

def main(pickles_folder, limit):
    res = {}

    for pickle_file in glob.glob(os.path.join(pickles_folder, "*.pickle")):
        cur = pickle.load(file(pickle_file))
        print "retrieved %s items from pickle file '%s' (first: %s, last: %s)" % (len(cur), pickle_file, sorted(cur.keys())[0], sorted(cur.keys())[-1])
        res.update(cur)

    indexes = sorted(res.keys())
    print "found a total of %s items (first: %s, last: %s)" % (len(indexes), indexes[0], indexes[-1])
    indexes = set(indexes)
    expected = set(xrange(indexes[-1] + 1))
    diff = expected - indexes
    print "missing %d items: %s" % (len(diff), ",".join(diff))

    y = {}
    for i in res.values():
        y[int(i['data']['name'])] = i['data']['media_count']

    for i,v in y.items():
        if v < limit:
                print i,v



if __name__ == "__main__":

    if len(sys.argv) < 3:
        print "usage: %s <pickles_folder> <limit>" % sys.argv[0]
        sys.exit(1)

    pickles_folder = args[0]
    limit = int(args[1])

    if not os.path.isdir(pickles_folder):
        print "%s is not a folder or doesn't exist" % pickles_folder
        sys.exit(1)

    main(pickles_folder, limit)

