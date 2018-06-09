#!/usr/bin/python

import json

class JsonUtil(object):
    @classmethod
    def to_json(cls, obj):
        return json.dumps(obj)

    @classmethod
    def from_json(cls, json_data):
        return json.loads(json_data)
