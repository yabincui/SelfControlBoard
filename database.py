#!/usr/bin/python

from google.appengine.ext import db

class Email(db.Model):
    email = db.StringProperty(required=True)

    @classmethod
    def get_key(cls, email):
        entity = Email.get_or_insert(email, email=email)
        return entity.key()


class TwoWeekGoal(db.Model):
    email = db.StringProperty(required=True)
    goal = db.StringProperty(required=True)
    start_date = db.DateTimeProperty(required=True)
    fulfill_status = db.IntegerProperty(default=0)

    @classmethod
    def create(cls, email, goal, start_date):
        email_key = Email.get_key(email)
        obj = TwoWeekGoal(email_key, email=email, goal=goal,
                          start_date=start_date)
        obj.put()

    @classmethod
    def query(cls, email):
        q = db.Query(TwoWeekGoal)
        q.ancestor(Email.get_key(email))
        q.order('-start_date')
        return q.fetch(None)

    @classmethod
    def clear(cls, email):
        for goal in cls.query(email):
            goal.delete()


class Database(object):
    pass
