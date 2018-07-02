#!/usr/bin/python

from google.appengine.ext import db

from time_util import TimeUtil

class Email(db.Model):
    email = db.StringProperty(required=True)
    passwd = db.StringProperty()
    registered = db.IntegerProperty(default=0)

    @classmethod
    def get_instance(cls, email):
        return Email.get_or_insert(email, email=email)

    @classmethod
    def create(cls, email, passwd):
        obj = cls.get_instance(email)
        if not obj.registered:
            obj.passwd = passwd
        else:
            return None
        obj.put()
        return obj


class TwoWeekGoal(db.Model):
    email = db.StringProperty(required=True)
    goal = db.TextProperty(required=True)
    start_date = db.DateTimeProperty(required=True)
    fulfill_status = db.IntegerProperty(default=0)

    @classmethod
    def create(cls, email, goal, start_date):
        email_key = Email.get_instance(email).key()
        obj = TwoWeekGoal(email_key, email=email, goal=goal,
                          start_date=start_date)
        obj.put()
        return obj

    @classmethod
    def query(cls, email, count_limit=-1):
        q = db.Query(TwoWeekGoal)
        q.ancestor(Email.get_instance(email).key())
        q.order('-start_date')
        if count_limit < 1:
            count_limit = None
        return q.fetch(count_limit)

    @classmethod
    def clear(cls, email):
        for goal in cls.query(email):
            goal.delete()

    @classmethod
    def update(cls, email, key, goal, start_date, fulfill_status):
        obj = TwoWeekGoal.get(key)
        if not obj or email != obj.email:
            return False
        if goal:
            obj.goal = goal
        if start_date:
            obj.start_date = start_date
        if fulfill_status is not None:
            obj.fulfill_status = fulfill_status
        obj.put()
        return True

    @classmethod
    def delete_instance(cls, email, key):
        obj = TwoWeekGoal.get(key)
        if not obj or email != obj.email:
            return False
        obj.delete()
        return True

    def to_object(self, tz_offset):
        return {'key': str(self.key()), 'goal': self.goal,
                'start_date': TimeUtil.utc_datetime_to_str(tz_offset,
                                                           self.start_date),
                'fulfill_status': self.fulfill_status}


class Database(object):
    pass
