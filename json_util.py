#!/usr/bin/python

import json

class JsonUtil(object):
    @classmethod
    def encode(cls, obj):
        return json.dumps(obj)

    @classmethod
    def decode(cls, json_data):
        return json.loads(json_data)
