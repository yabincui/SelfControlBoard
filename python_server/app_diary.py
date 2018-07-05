
from app_base import AppBase
from database import Diary
from time_util import TimeUtil

class DiaryApp(AppBase):
    """ Handle requests for Diary. """
    def handle_add_diary(self):
        diary = self.request.get('diary')
        tz_offset = self.request.get('tz_offset')
        date = self.request.get('date')
        if not self.email or not diary or not tz_offset or not date:
            return False
        date = TimeUtil.str_to_utc_datetime(int(tz_offset), date)
        diary = Diary.create(self.email, date, diary)
        return True, {'key': diary.key.urlsafe()}

    def handle_get_diary(self):
        tz_offset = self.request.get('tz_offset')
        key = self.request.get('key')
        if not self.email or not tz_offset or not key:
            return False
        diary = Diary.get_instance(key, self.email)
        if not diary:
            return False
        return True, diary.to_object(int(tz_offset))

    def handle_get_diaries(self):
        tz_offset = self.request.get('tz_offset')
        count_limit = self.request.get('count_limit')
        cursor = self.request.get('cursor')
        min_date = self.request.get('min_date')
        max_date = self.request.get('max_date')
        if not self.email or not tz_offset or not count_limit:
            return False
        count_limit = int(count_limit)
        tz_offset = int(tz_offset)
        if min_date:
            min_date = TimeUtil.str_to_utc_datetime(tz_offset, min_date)
        if max_date:
            max_date = TimeUtil.str_to_utc_datetime(tz_offset, max_date)
        diaries, next_cursor = Diary.query_instances(self.email, count_limit, cursor, min_date,
            max_date)
        data = []
        for diary in diaries:
            data.append(diary.to_object(tz_offset))
        result = {'data': data}
        if next_cursor:
            result['next_cursor'] = next_cursor
        return True, result

    def handle_update_diary(self):
        key = self.request.get('key')
        diary = self.request.get('diary')
        tz_offset = self.request.get('tz_offset')
        date = self.request.get('date')
        if not self.email or not key or not diary or not tz_offset or not date:
            return False
        date = TimeUtil.str_to_utc_datetime(int(tz_offset), date)
        return Diary.update(key, self.email, date, diary)

    def handle_delete_diary(self):
        key = self.request.get('key')
        if not self.email or not key:
            return False
        return Diary.delete_instance(key, self.email)

    def handle_clear_diaries(self):
        if not self.email:
            return False
        Diary.clear(self.email)
        return True
