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

    def setup(self):
        self.assertEquals('ok', self.send_request('/test_set_email',
                          {'email': 'splintcoder@gmail.com'}))

class TestTwoWeekGoal(TestBase):
    def test_connection(self):
        self.assertEquals('hello, world1!', self.send_request('/', {}))

    def test_login(self):
        self.assertEquals('ok', self.send_request('/test_set_email',
                            {'email': 'splintcoder@gmail.com'}))
        self.assertEquals('splintcoder@gmail.com',
                          self.send_request('/get_email', {}))

    def test_datetime(self):
        self.assertEquals('2018/7/2/0/0/0', self.send_request('/test_datetime',
                          {'tz_offset': '-7', 'to_tz_offset': '-7',
                           'datetime': '2018/7/2'}))
        self.assertEquals('2018/7/2/7/0/0', self.send_request('/test_datetime',
                          {'tz_offset': '-7', 'to_tz_offset': '0',
                           'datetime': '2018/7/2'}))
        self.assertEquals('2018/7/1/23/0/0', self.send_request('/test_datetime',
                          {'tz_offset': '-7', 'to_tz_offset': '-8',
                           'datetime': '2018/7/2'}))

    def test_two_week_goal(self):
        self.assertEquals('ok', self.send_request('/add_two_week_goal',
                          {'goal': 'help others', 'tz_offset': '-7',
                           'start_date': '2018/6/7'}))



if __name__ == '__main__':
    unittest.main(failfast=True)
