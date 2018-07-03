import webapp2

from python_server.app_login import LoginApp
from python_server.app_twoweekgoal import TwoWeekGoalApp
from python_server.app_diary import DiaryApp

class AppDistributor(webapp2.RequestHandler):
    def __init__(self, *args, **kwargs):
        super(AppDistributor, self).__init__(*args, **kwargs)
        self.dist_table = [
            ('/twoweekgoal', TwoWeekGoalApp()),
            ('/diary', DiaryApp()),
            ('/', LoginApp()),
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
