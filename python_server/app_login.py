from app_base import AppBase
from database import Email
from time_util import TimeUtil
from json_util import JsonUtil
from url_util import UrlUtil

class LoginApp(AppBase):
    """ LoginApp: For login/register and some basic tests. """
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
        email = self.request.get('email')
        passwd = self.request.get('passwd')
        if not email or not passwd:
            return False
        entity = Email.create(email, passwd)
        if not entity:
            return False, '%s has been registered' % email
        url = UrlUtil.urlencode('/confirm_register',
                {'key': entity.key.urlsafe(), 'passwd': passwd})
        self.send_email(email, 'Register confirm mail',
            """Please click below url to login:
                %s
            """ % ('https://selfcontrolboard.appspot.com' + url))
        if self.is_test_env():
            return True, 'http://localhost:8080' + url
        else:
            return True, 'ok'

    def handle_confirm_register(self):
        key = self.request.get('key')
        passwd = self.request.get('passwd')
        entity = Email.get_by_key(key)
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
