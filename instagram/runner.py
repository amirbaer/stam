#!/usr/bin/python2.7

import sys
import os
import time

import pickle
import urllib2
import json

from optparse import OptionParser


URL = 'https://api.instagram.com/v1/tags/%d?access_token=%s'
TIMEOUT = 15

if len(sys.argv) < 4:
    print "usage: %s <access_token> <output_pickle_file> <start_index>" % sys.argv[0]
    sys.exit(1)

def create_parser():
    parser = OptionParser()
    parser.set_usage("%prog <access_token> <output_pickle_file> <start_index> [options]\n")
    parser.add_option("-n", "--num-indexes", dest = "num_indexes", default = 50000,
                        help = "how many indexes to check before stopping")
    return parser

def main(access_token, pickle_file, start_index, num_indexes):
    res = {}
    timestamp = time.time()

    if os.path.exists(pickle_file):
        res = pickle.load(file(pickle_file))
        print "retrieved %s items from pickle file (first: %s, last: %s)" % (len(res), sorted(res.keys())[0], sorted(res.keys())[-1])

    for i in xrange(start_index, start_index + num_indexes):
        try:
            ans = json.load(urllib2.urlopen(URL % (i, access_token)))
            print i
            res[i] = ans
            if not ans.has_key('meta') or not ans['meta'].has_key('code') or ans['meta']['code'] != 200:
                print "i'm out"
                break
        except Exception, e:
            print "caught exception:", e

            print "writing to file...",
            pickle.dump(res, file(pickle_file, 'w'))
            print " done"

            print "going to sleep for %d minutes" % TIMEOUT
            time.sleep(TIMEOUT * 60)

        if i % 200 == 0:
            
            print "writing to file...",
            pickle.dump(res, file(pickle_file, 'w'))
            print " done (%.1f minutes since last save)" % ((time.time() - timestamp) / 60)
            timestamp = time.time()

    pickle.dump(res, file(pickle_file, 'w'))
    print "done"


if __name__ == "__main__":
    parser = create_parser()
    options, args = parser.parse_args()

    if len(args) != 3:
        print "wrong number of args"
        parser.print_usage()
        sys.exit(1)

    access_token = args[0]
    pickle_file = args[1]
    start_index = int(args[2])

    main(access_token, pickle_file, start_index, options.num_indexes)
    




