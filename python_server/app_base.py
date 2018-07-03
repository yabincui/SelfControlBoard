import inspect
import os
import types
import webapp2

from google.appengine.api.mail import send_mail

from database import Email, TwoWeekGoal
from time_util import TimeUtil
from json_util import JsonUtil
from url_util import UrlUtil




class AppBase(object):
    def __init__(self):
        self.handle_table = self.build_handle_table()
        self.request = None
        self.response = None
        self.email = None

    def build_handle_table(self):
        table = {}
        for name, method in inspect.getmembers(self, inspect.ismethod):
            handle_name = self._get_handle_name(name)
            if handle_name:
                table[handle_name] = method
        print('build table')
        for key in table:
            print('\t%s' % key)
        return table

    def process_request(self, request_path, request, response):
        handle = self.handle_table.get(request_path)
        if handle:
            self.request = request
            self.response = response
            self.email = self.parse_email()
            ret = handle()
            if ret is None:
                return True
            msg = None
            print('ret = %s' % str(ret))
            if isinstance(ret, tuple):
                ret, msg = ret
            data = {}
            data['status'] = 'ok' if ret else 'error'
            if msg is not None:
                data['msg'] = msg
            print('data = %s' % data)
            self.response.out.write(JsonUtil.encode(data))
            return True
        print("can't find handle for %s" % request_path)
        return False

    def parse_email(self):
        email = self.request.get('email')
        passwd = self.request.get('passwd')
        if email and passwd:
            entity = Email.get_instance(email)
            if entity and entity.passwd == passwd and entity.registered == 1:
                return email
            if self.is_test_env() and email == 'test@email.com':
                return email
        return None

    def send_email(self, to, subject, body):
        send_mail('user@selfcontrolboard.appspotmail.com', to, subject, body)

    def is_test_env(self):
        return not os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/')

    def _get_handle_name(self, method_name):
        if method_name.startswith('handle_') and method_name != 'handle_exception':
            return '/' + method_name[7:]
        if method_name == 'handle':
            return '/'
        if self.is_test_env() and method_name.startswith('test_'):
            return '/' + method_name
        return None