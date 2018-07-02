import inspect
import os
import types
import webapp2

from google.appengine.api.mail import send_mail

from database import Email, TwoWeekGoal
from time_util import TimeUtil
from json_util import JsonUtil
from url_util import UrlUtil

def is_test_env():
    return not os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/')

def get_handle_name(method_name):
    if method_name.startswith('handle_') and method_name != 'handle_exception':
        return '/' + method_name[7:]
    if method_name == 'handle':
        return '/'
    if is_test_env() and method_name.startswith('test_'):
        return '/' + method_name
    return None

def send_email(to, subject, body):
    send_mail('user@selfcontrolboard.appspotmail.com', to, subject, body)


class AppBase(object):
    def __init__(self):
        self.handle_table = self.build_handle_table()
        self.request = None
        self.response = None
        self.email = None

    def build_handle_table(self):
        table = {}
        for name, method in inspect.getmembers(self, inspect.ismethod):
            handle_name = get_handle_name(name)
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
            if is_test_env() and email == 'test@email.com':
                return email
        return None


class MainApp(AppBase):
    """ MainApp: For login/register and some basic tests. """
    def handle(self):
        with open('main.html') as fh:
            data = fh.read()
        self.response.out.write(data)

    def test_connection(self):
        self.response.out.write('hello, world1!')

    def test_datetime(self):
        timezone_offset = self.request.get('tz_offset')
        date = self.request.get('datetime')
        to_timezone_offset = self.request.get('to_tz_offset')
        if not timezone_offset or not date or not to_timezone_offset:
            return False
        date = TimeUtil.str_to_utc_datetime(int(timezone_offset), date)
        result = TimeUtil.utc_datetime_to_str(int(to_timezone_offset), date)
        self.response.out.write(result)

    def test_json(self):
        return True, JsonUtil.decode(self.request.get('data'))

    def handle_get_email(self):
        if self.email:
            return True, self.email
        return True, 'None'

    def handle_register(self):
        if self.email:
            return False, '%s has been registered' % self.email
        email = self.request.get('email')
        passwd = self.request.get('passwd')
        if not email or not passwd:
            return False
        entity = Email.create(email, passwd)
        if not entity:
            return False, '%s has been registered' % email
        url = UrlUtil.urlencode('/confirm_register', {'key': entity.key(), 'passwd': passwd})
        send_email(email, 'Register confirm mail',
            """Please click below url to login:
                %s
            """ % ('https://selfcontrolboard.appspot.com' + url))
        if is_test_env():
            return True, 'http://localhost:8080' + url
        else:
            return True, 'ok'

    def handle_confirm_register(self):
        key = self.request.get('key')
        passwd = self.request.get('passwd')
        entity = Email.get(key)
        if not entity or entity.passwd != passwd:
            return False
        entity.registered = 1
        entity.put()
        return True, 'ok'

    def handle_login(self):
        email = self.email
        if not email:
            email = self.request.get('email')
            if not email:
                return False
            entity = Email.get_instance(email)
            if entity.registered:
                return False, 'password is wrong'
            return False, "%s hasn't been registered" % email
        return True, email


class TwoWeekGoalApp(AppBase):
    """ Handle request for TwoWeekGoal. """
    def handle_add_goal(self):
        goal = self.request.get('goal')
        timezone_offset = self.request.get('tz_offset')
        start_date = self.request.get('start_date')
        if not self.email or not goal or not timezone_offset or not start_date:
            return False
        start_date = TimeUtil.str_to_utc_datetime(int(timezone_offset),
                                                  start_date)
        goal = TwoWeekGoal.create(self.email, goal, start_date)
        return True, {'key': str(goal.key())}

    def handle_get_goal(self):
        tz_offset = self.request.get('tz_offset')
        key = self.request.get('key')
        if not tz_offset or not key or not self.email:
            return False
        goal = TwoWeekGoal.get(key)
        if not goal:
            return False
        return True, goal.to_object(int(tz_offset))

    def handle_get_goals(self):
        tz_offset = self.request.get('tz_offset')
        count_limit = self.request.get('count_limit')
        if not tz_offset or not self.email or not count_limit:
            return False
        tz_offset = int(tz_offset)
        count_limit = int(count_limit)
        goals = TwoWeekGoal.query(self.email, count_limit)
        data = []
        for goal in goals:
            data.append(goal.to_object(tz_offset))
        return True, data

    def handle_update_goal(self):
        key = self.request.get('key')
        goal = self.request.get('goal')
        timezone_offset = self.request.get('tz_offset')
        start_date = self.request.get('start_date')
        fulfill_status = self.request.get('fulfill_status')
        if not key or not self.email:
            return False
        if start_date:
            if not timezone_offset:
                return False
            start_date = TimeUtil.str_to_utc_datetime(int(timezone_offset), start_date)
        if fulfill_status:
            fulfill_status = int(fulfill_status)
        return TwoWeekGoal.update(self.email, key, goal, start_date, fulfill_status)

    def handle_delete_goal(self):
        key = self.request.get('key')
        if not key or not self.email:
            return False
        return TwoWeekGoal.delete_instance(self.email, key)

    def handle_clear_goals(self):
        if not self.email:
            return False
        TwoWeekGoal.clear(self.email)
        return True



class AppDistributor(webapp2.RequestHandler):
    def __init__(self, *args, **kwargs):
        super(AppDistributor, self).__init__(*args, **kwargs)
        self.dist_table = [
            ('/twoweekgoal', TwoWeekGoalApp()),
            ('/', MainApp()),
        ]

    def get(self):
        return self.post()

    def post(self):
        print('request_path = "%s"' % self.request.path)
        result = False
        for prefix, app in self.dist_table:
            if self.request.path.startswith(prefix):
                path = self.request.path[len(prefix):]
                if not path.startswith('/'):
                    path = '/' + path
                result = app.process_request(path, self.request, self.response)
                break
        if not result:
            self.default_handler()


    def default_handler(self):
        with open('main.html') as fh:
            data = fh.read()
        self.response.out.write(data)


app = webapp2.WSGIApplication([
    ('/.*', AppDistributor),
], debug=True)
