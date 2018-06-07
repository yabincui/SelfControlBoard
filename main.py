import types
import webapp2

def get_handle_name(method_name):
    if method_name.startswith('handle_'):
        return '/' + method_name[7:]
    return '/'

class MainPage(webapp2.RequestHandler):
    def __init__(self, *args, **kwargs):
        super(MainPage, self).__init__(*args, **kwargs)
        self.handle_table = {}
        for name, value in MainPage.__dict__.items():
            if type(value) == types.FunctionType and name.startswith('handle'):
                self.handle_table[get_handle_name(name)] = value

    def get(self):
        return self.post()

    def post(self):
        handle = self.handle_table.get(self.request.path)
        if not handle:
            self.response.status = 404
        else:
            handle(self)

    def handle(self):
        self.response.out.write('hello, world1!')


app = webapp2.WSGIApplication([
    ('/', MainPage),
], debug=True)
