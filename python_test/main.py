#!/usr/bin/python

import json
import random
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

    def test_json(self):
        data = self.send_request('/test_json',
                                 {'data': '{"hello": 3, "what": "you"}'})
        data = json.loads(data)
        self.assertEquals(len(data), 2)
        self.assertEquals(3, data['hello'])
        self.assertEquals('you', data['what'])
        data = self.send_request('/test_json',
                                 {'data': '["hello", 3]'})
        data = json.loads(data)
        self.assertEquals(len(data), 2)
        self.assertEquals('hello', data[0])
        self.assertEquals(3, data[1])

    def test_two_week_goal(self):
        # Clear
        self.assertEquals('ok', self.send_request('/clear_two_week_goals', {}))
        value = random.randint(0, 1000000)
        # Add
        data = self.send_request('/add_two_week_goal',
                                 {'goal': 'help %d people' % value,
                                  'tz_offset': '-7', 'start_date': '2018/6/7'})
        data = json.loads(data)
        self.assertEquals(len(data), 1)
        self.assertTrue(data['key'] is not None)
        expected_key = data['key']
        # Query
        data = self.send_request('/get_two_week_goals',
                                 {'tz_offset': '-7'})
        data = json.loads(data)
        self.assertEquals(len(data), 1)
        data = data[0]
        self.assertEquals(expected_key, data['key'])
        self.assertEquals('help %d people' % value, data['goal'])
        self.assertEquals('2018/6/7/0/0/0', data['start_date'])
        self.assertEquals(0, data['fulfill_status'])
        # Update
        self.assertEquals('ok', self.send_request('/update_two_week_goal',
                          {'key': expected_key,
                           'goal': 'help more people',
                           'start_date': '2018/6/8/0/0/0',
                           'tz_offset': '-7',
                           'fulfill_status': '1'}))
        # Get
        data = self.send_request('/get_two_week_goal',
                                 {'key': expected_key, 'tz_offset': '-7'})
        data = json.loads(data)
        self.assertEquals(expected_key, data['key'])
        self.assertEquals('help more people', data['goal'])
        self.assertEquals('2018/6/8/0/0/0', data['start_date'])
        self.assertEquals(1, data['fulfill_status'])
        # Query again
        data2 = self.send_request('/get_two_week_goals', {'tz_offset': '-7'})
        data2 = json.loads(data2)
        self.assertEquals(len(data2), 1)
        self.assertEquals(data, data2[0])
        # Clear
        self.assertEquals('ok', self.send_request('/clear_two_week_goals', {}))
        data2 = self.send_request('/get_two_week_goals', {'tz_offset': '-7'})
        data2 = json.loads(data2)
        self.assertEquals(len(data2), 0)



if __name__ == '__main__':
    unittest.main(failfast=True)
