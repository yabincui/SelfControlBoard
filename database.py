#!/usr/bin/python

from google.appengine.ext import db

class TwoWeekGoal(db.Model):
    email = db.StringProperty(required=True)
    goal = db.StringProperty(required=True)
    start_date = db.DateTimeProperty(required=True)
    fulfill_status = db.IntegerProperty(default=0)

    @classmethod
    def create(cls, email, goal, start_date):
        obj = TwoWeekGoal(email=email, goal=goal, start_date=start_date)
        obj.put()

    @classmethod
    def query(cls, email):
        q = db.Query(TwoWeekGoal)
        q.filter('email = ', email)
        q.order('-start_date')
        return q.fetch(None)


class Database(object):
    pass
