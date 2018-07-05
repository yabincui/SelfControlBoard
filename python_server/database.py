#!/usr/bin/python

from google.appengine.ext import ndb
from google.appengine.datastore.datastore_query import Cursor

from time_util import TimeUtil

class Email(ndb.Model):
    email = ndb.StringProperty(required=True)
    passwd = ndb.StringProperty()
    registered = ndb.IntegerProperty(default=0)

    @classmethod
    def get_instance(cls, email):
        return Email.get_or_insert(email, email=email)

    @classmethod
    def get_by_key(cls, key):
        return ndb.Key(urlsafe=key).get()

    @classmethod
    def create(cls, email, passwd):
        obj = cls.get_instance(email)
        if not obj.registered:
            obj.passwd = passwd
        else:
            return None
        obj.put()
        return obj


class TwoWeekGoal(ndb.Model):
    email = ndb.StringProperty(required=True)
    goal = ndb.TextProperty(required=True)
    start_date = ndb.DateTimeProperty(required=True)
    fulfill_status = ndb.IntegerProperty(default=0)

    @classmethod
    def create(cls, email, goal, start_date):
        email_key = Email.get_instance(email).key
        obj = TwoWeekGoal(parent=email_key, email=email, goal=goal,
                          start_date=start_date)
        obj.put()
        return obj

    @classmethod
    def get_by_key(cls, key):
        return ndb.Key(urlsafe=key).get()

    @classmethod
    def get_instance(cls, key, email):
        obj = TwoWeekGoal.get_by_key(key)
        if not obj or obj.email != email:
            return None
        return obj

    @classmethod
    def query_instances(cls, email, count_limit=-1):
        q = TwoWeekGoal.query(ancestor=Email.get_instance(email).key).order(-TwoWeekGoal.start_date)
        if count_limit < 1:
            count_limit = None
        return q.fetch(count_limit)

    @classmethod
    def clear(cls, email):
        for goal in cls.query_instances(email):
            goal.key.delete()

    @classmethod
    def update(cls, email, key, goal, start_date, fulfill_status):
        obj = TwoWeekGoal.get_by_key(key)
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
        obj = TwoWeekGoal.get_by_key(key)
        if not obj or email != obj.email:
            print('delete_instance obj = %s, key = %s' % (obj, key))
            return False
        obj.key.delete()
        return True

    def to_object(self, tz_offset):
        return {'key': self.key.urlsafe(), 'goal': self.goal,
                'start_date': TimeUtil.utc_datetime_to_str(tz_offset,
                                                           self.start_date),
                'fulfill_status': self.fulfill_status}


class Diary(ndb.Model):
    email = ndb.StringProperty(required=True)
    date = ndb.DateTimeProperty(required=True)
    diary = ndb.TextProperty(required=True)

    @classmethod
    def create(cls, email, date, diary):
        email_key = Email.get_instance(email).key
        obj = Diary(parent=email_key, email=email, date=date, diary=diary)
        obj.put()
        return obj

    @classmethod
    def get_by_key(cls, key):
        return ndb.Key(urlsafe=key).get()

    @classmethod
    def get_instance(cls, key, email):
        obj = Diary.get_by_key(key)
        if not obj or obj.email != email:
            return None
        return obj

    @classmethod
    def query_instances(cls, email, count_limit, cursor, min_date=None, max_date=None):
        if cursor:
            cursor = Cursor(urlsafe=cursor)
        else:
            cursor = None
        q = Diary.query(ancestor=Email.get_instance(email).key)
        if min_date:
            q = q.filter(Diary.date >= min_date)
        if max_date:
            q = q.filter(Diary.date <= max_date)
        q = q.order(-Diary.date)
        diary, next_cursor, more = q.fetch_page(count_limit, start_cursor=cursor)
        if more and next_cursor:
            next_cursor = next_cursor.urlsafe()
            return diary, next_cursor
        return diary, None

    @classmethod
    def update(cls, key, email, date, diary):
        obj = Diary.get_instance(key, email)
        if not obj:
            return False
        obj.date = date
        obj.diary = diary
        obj.put()
        return True

    @classmethod
    def delete_instance(cls, key, email):
        obj = Diary.get_instance(key, email)
        if not obj:
            return False
        obj.key.delete()
        return True

    def to_object(self, tz_offset):
        return {'key': self.key.urlsafe(), 'date': TimeUtil.utc_datetime_to_str(tz_offset, self.date),
                'diary': self.diary}

    @classmethod
    def clear(cls, email):
        q = Diary.query(ancestor=Email.get_instance(email).key)
        diaries = q.fetch(None)
        for diary in diaries:
            diary.key.delete()
