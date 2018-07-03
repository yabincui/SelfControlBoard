#!/usr/bin/python

import datetime

class TimeUtil(object):
    @classmethod
    def str_to_utc_datetime(cls, timezone_offset, datetime_str):
        """Convert from datetime string to utc datetime.
            timezone_offset: an integer of offset to UTC time.
            datetime_str: a date string in format
                            "year/month/day/hour/minute/second".
            Return a datetime if succeed, otherwise return None.
        """
        items = datetime_str.split('/')
        values = [0] * 6
        for i, item in enumerate(items):
            values[i] = int(item)
        date = datetime.datetime(values[0], values[1], values[2], values[3],
                                 values[4], values[5])
        date = date - datetime.timedelta(hours=timezone_offset)
        return date

    @classmethod
    def utc_datetime_to_str(cls, timezone_offset, datetime_obj):
        d = datetime_obj + datetime.timedelta(hours=timezone_offset)
        return '%d/%d/%d/%d/%d/%d' % (d.year, d.month, d.day, d.hour, d.minute,
                                      d.second)
