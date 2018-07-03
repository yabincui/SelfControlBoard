#!/usr/bin/python

import json
import os
import random
import sys
import unittest

sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
from json_util import JsonUtil
from url_util import UrlUtil

class TestBase(unittest.TestCase):

    def _send_test_request(self, address, value_map, send_fn):
        url = 'http://localhost:8080' + address
        if 'email' not in value_map:
            value_map['email'] = 'test@email.com'
            if 'passwd' not in value_map:
                value_map['passwd'] = 'no passwd'
        return send_fn(url, value_map)

    def get(self, address, value_map):
        return self._send_test_request(address, value_map, UrlUtil.get)

    def get_json(self, address, value_map, expect_status=True):
        data = self._send_test_request(address, value_map, UrlUtil.get_json)
        self.assertEquals(data['status'], 'ok' if expect_status else 'error')
        if 'msg' in data:
            return data['msg']
        return True


class LoginTest(TestBase):
    def test_connection(self):
        self.assertEquals('hello, world1!', self.get('/test_connection', {}))

    def test_login(self):
        self.assertEquals('test@email.com', self.get_json('/get_email', {}))

    def test_datetime(self):
        self.assertEquals('2018/7/2/0/0/0', self.get('/test_datetime',
                          {'tz_offset': '-7', 'to_tz_offset': '-7',
                           'datetime': '2018/7/2'}))
        self.assertEquals('2018/7/2/7/0/0', self.get('/test_datetime',
                          {'tz_offset': '-7', 'to_tz_offset': '0',
                           'datetime': '2018/7/2'}))
        self.assertEquals('2018/7/1/23/0/0', self.get('/test_datetime',
                          {'tz_offset': '-7', 'to_tz_offset': '-8',
                           'datetime': '2018/7/2'}))

    def test_json(self):
        data = self.get_json('/test_json', {'data': '{"hello": 3, "what": "you"}'})
        self.assertEquals(len(data), 2)
        self.assertEquals(3, data['hello'])
        self.assertEquals('you', data['what'])
        data = self.get_json('/test_json', {'data': '["hello", 3]'})
        self.assertEquals(len(data), 2)
        self.assertEquals('hello', data[0])
        self.assertEquals(3, data[1])

    def test_register(self):
        value = random.randint(0, 1000000)
        email_name = 'splintcoder%d@gmail.com' % value
        data = self.get_json('/register', {'email': email_name, 'passwd': '123456='})
        address, dic = UrlUtil.urldecode(data)
        self.assertEquals('http://localhost:8080/confirm_register', address)
        self.assertIn('key', dic)
        self.assertEquals(dic['passwd'], '123456=')
        self.assertEquals('ok', self.get_json('/confirm_register', dic))
        # Fail to repeat register
        data = self.get_json('/register', {'email': email_name, 'passwd': '123456='}, False)
        self.assertEquals(data, '%s has been registered' % email_name)
        data = self.get_json('/register', {'email': email_name, 'passwd': '123456'}, False)
        self.assertEquals(data, '%s has been registered' % email_name)

        # Try login
        self.assertEquals(email_name, self.get_json('/login',
                                                    {'email': email_name, 'passwd': '123456='}))
        self.assertEquals("%sa hasn't been registered" % email_name,
                          self.get_json('/login', {'email': email_name + 'a', 'passwd': '123456='},
                                        False))
        self.assertEquals('password is wrong',
                          self.get_json('/login', {'email': email_name, 'passwd': '123456'}, False))


class TwoWeekGoalTest(TestBase):
    def test_two_week_goal(self):
        # Clear
        self.assertTrue(self.get_json('/twoweekgoal/clear_goals', {}))
        value = random.randint(0, 1000000)
        # Add
        data = self.get_json('/twoweekgoal/add_goal',
                                 {'goal': 'help %d people' % value,
                                  'tz_offset': '-7', 'start_date': '2018/6/7'})
        self.assertEquals(len(data), 1)
        self.assertIn('key', data)
        expected_key = data['key']
        # Query
        data = self.get_json('/twoweekgoal/get_goals', {'tz_offset': '-7', 'count_limit': '-1'})
        self.assertEquals(len(data), 1)
        data = data[0]
        self.assertEquals(expected_key, data['key'])
        self.assertEquals('help %d people' % value, data['goal'])
        self.assertEquals('2018/6/7/0/0/0', data['start_date'])
        self.assertEquals(0, data['fulfill_status'])
        # Update
        self.assertTrue(self.get_json('/twoweekgoal/update_goal',
                          {'key': expected_key,
                           'goal': 'help more people',
                           'start_date': '2018/6/8/0/0/0',
                           'tz_offset': '-7',
                           'fulfill_status': '1'}))
        # Get
        data = self.get_json('/twoweekgoal/get_goal', {'key': expected_key, 'tz_offset': '-7'})
        self.assertEquals(expected_key, data['key'])
        self.assertEquals('help more people', data['goal'])
        self.assertEquals('2018/6/8/0/0/0', data['start_date'])
        self.assertEquals(1, data['fulfill_status'])
        # Query again
        data2 = self.get_json('/twoweekgoal/get_goals', {'tz_offset': '-7', 'count_limit': '1'})
        self.assertEquals(len(data2), 1)
        self.assertEquals(data, data2[0])
        # Clear
        self.assertTrue(self.get_json('/twoweekgoal/clear_goals', {}))
        data2 = self.get_json('/twoweekgoal/get_goals', {'tz_offset': '-7', 'count_limit': '-1'})
        self.assertEquals(len(data2), 0)

    def test_delete(self):
        self.assertTrue(self.get_json('/twoweekgoal/clear_goals', {}))
        data1 = self.get_json('/twoweekgoal/add_goal', {'goal': 'data1', 'tz_offset': '-7',
                                                        'start_date': '2018/6/7'})
        self.assertIn('key', data1)
        data2 = self.get_json('/twoweekgoal/add_goal', {'goal': 'data2', 'tz_offset': '-7',
                                                        'start_date': '2018/6/8'})
        self.assertIn('key', data2)
        allData = self.get_json('/twoweekgoal/get_goals', {'tz_offset': '-7', 'count_limit': '-1'})
        self.assertEquals(len(allData), 2)
        self.assertEquals(allData[0]['key'], data2['key'])
        self.assertEquals(allData[1]['key'], data1['key'])
        self.assertTrue(self.get_json('/twoweekgoal/delete_goal', {'key': data1['key']}))
        allData = self.get_json('/twoweekgoal/get_goals', {'tz_offset': '-7', 'count_limit': '-1'})
        self.assertEquals(len(allData), 1)
        self.assertEquals(allData[0]['key'], data2['key'])


class DiaryTest(TestBase):
    def get_diaries(self, count_limit_each_req):
        diaries = []
        cursor = None
        while True:
            req = {'tz_offset': '-7', 'count_limit': count_limit_each_req}
            if cursor:
                req['cursor'] = cursor
            data = self.get_json('/diary/get_diaries', req)
            self.assertTrue(len(data['data']) <= count_limit_each_req)
            for diary in data['data']:
                diaries.append(diary)
            if 'next_cursor' in data:
                cursor = data['next_cursor']
            else:
                break
        return diaries

    def test_smoke(self):
        # Clear
        self.assertTrue(self.get_json('/diary/clear_diaries', {}))
        expected_keys = []
        for i in range(20):
            data = self.get_json('/diary/add_diary', {'tz_offset': '-7',
                                                      'date': '2018/7/%d' % (i + 4),
                                                      'diary': 'Go to mall %d today' % i})
            self.assertEquals(len(data), 1)
            self.assertIn('key', data)
            expected_keys.append(data['key'])
        # Query all
        diaries = self.get_diaries(20)
        self.assertEquals(len(diaries), 20)
        for i in range(20):
            ri = 19 - i
            self.assertEquals(diaries[i]['key'], expected_keys[ri])
            self.assertEquals(diaries[i]['diary'], 'Go to mall %d today' % ri)
            self.assertEquals(diaries[i]['date'], '2018/7/%d/0/0/0' % (ri + 4))
        # Query at different count_limit_each_req
        for count_limit in range(1, 3, 24):
            d = self.get_diaries(count_limit)
            self.assertEquals(diaries, d)



if __name__ == '__main__':
    unittest.main(failfast=True)
