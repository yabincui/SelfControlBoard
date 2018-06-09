import types
import webapp2

from database import TwoWeekGoal
from time_util import TimeUtil
from json_util import JsonUtil

def is_test_env():
    return not os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/')

def get_handle_name(method_name):
    if method_name.startswith('handle_'):
        return '/' + method_name[7:]
    if method_name == 'handle':
        return '/'
    if is_test_env and method_name.startswith('test_'):
        return '/' + method_name
    return None

test_email = None

class MainPage(webapp2.RequestHandler):
    def __init__(self, *args, **kwargs):
        super(MainPage, self).__init__(*args, **kwargs)
        self.handle_table = {}
        for name, value in MainPage.__dict__.items():
            if type(value) == types.FunctionType:
                handle_name = get_handle_name(name)
                if handle_name:
                    self.handle_table[handle_name] = value
        global test_email
        self.email = test_email

    def get(self):
        return self.post()

    def post(self):
        handle = self.handle_table.get(self.request.path)
        if not handle:
            self.response.status = 404
        else:
            if not handle(self):
                self.response.write('error')

    def handle(self):
        self.response.out.write('hello, world1!')
        return True

    def test_set_email(self):
        email = self.request.get('email')
        if not email:
            return False
        global test_email
        test_email = email
        self.response.out.write('ok')
        return True

    def test_datetime(self):
        timezone_offset = self.request.get('tz_offset')
        date = self.request.get('datetime')
        to_timezone_offset = self.request.get('to_tz_offset')
        if not timezone_offset or not date or not to_timezone_offset:
            return False
        date = TimeUtil.str_to_utc_datetime(int(timezone_offset), date)
        result = TimeUtil.utc_datetime_to_str(int(to_timezone_offset), date)
        self.response.out.write(result)
        return True

    def test_json(self):
        data = JsonUtil.from_json(self.request.get('data'))
        self.response.out.write(JsonUtil.to_json(data))
        return True

    def handle_get_email(self):
        if self.email:
            self.response.out.write(self.email)
        else:
            self.response.out.write('None')
        return True

    def handle_add_two_week_goal(self):
        goal = self.request.get('goal')
        timezone_offset = self.request.get('tz_offset')
        start_date = self.request.get('start_date')
        if not self.email or not goal or not timezone_offset or not start_date:
            return False
        start_date = TimeUtil.str_to_utc_datetime(int(timezone_offset),
                                                  start_date)
        goal = TwoWeekGoal.create(self.email, goal, start_date)
        data = {'key': str(goal.key())}
        self.response.out.write(JsonUtil.to_json(data))
        return True

    def handle_get_two_week_goal(self):
        tz_offset = self.request.get('tz_offset')
        key = self.request.get('key')
        if not tz_offset or not key or not self.email:
            return False
        goal = TwoWeekGoal.get(key)
        if not goal:
            return False
        data = goal.to_object(int(tz_offset))
        self.response.out.write(JsonUtil.to_json(data))
        return True

    def handle_get_two_week_goals(self):
        tz_offset = self.request.get('tz_offset')
        if not tz_offset or not self.email:
            return False
        tz_offset = int(tz_offset)
        goals = TwoWeekGoal.query(self.email)
        data = []
        for goal in goals:
            data.append(goal.to_object(tz_offset))
        self.response.out.write(JsonUtil.to_json(data))
        return True

    def handle_update_two_week_goal(self):
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
            start_date = TimeUtil.str_to_utc_datetime(int(timezone_offset),
                                                      start_date)
        if fulfill_status:
            fulfill_status = int(fulfill_status)
        if not TwoWeekGoal.update(self.email, key, goal, start_date,
                                  fulfill_status):
            return False
        self.response.out.write('ok')
        return True

    def handle_clear_two_week_goals(self):
        if not self.email:
            return False
        TwoWeekGoal.clear(self.email)
        self.response.out.write('ok')
        return True


app = webapp2.WSGIApplication([
    ('/.*', MainPage),
], debug=True)
