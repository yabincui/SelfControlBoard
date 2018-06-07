#!/usr/bin/python

import unittest
import urllib
import urllib2

def send_url_request(url, value_map):
    """ Send value_map to selected url, and receive reply. """
    data = urllib.urlencode(value_map)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    return response.read()


class TestBase(unittest.TestCase):
    def send_request(self, address, value_map):
        url = 'http://localhost:8080' + address
        return send_url_request(url, value_map)


class TestConnection(TestBase):
    def test_connection(self):
        self.assertEquals('hello, world1!', self.send_request('/', {}))


if __name__ == '__main__':
    unittest.main(failfast=True)
