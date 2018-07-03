from app_base import AppBase
from database import TwoWeekGoal
from time_util import TimeUtil

class TwoWeekGoalApp(AppBase):
    """ Handle request for TwoWeekGoal. """
    def handle_add_goal(self):
        goal = self.request.get('goal')
        timezone_offset = self.request.get('tz_offset')
        start_date = self.request.get('start_date')
        if not self.email or not goal or not timezone_offset or not start_date:
            return False
        start_date = TimeUtil.str_to_utc_datetime(int(timezone_offset),
                                                  start_date)
        goal = TwoWeekGoal.create(self.email, goal, start_date)
        return True, {'key': str(goal.key())}

    def handle_get_goal(self):
        tz_offset = self.request.get('tz_offset')
        key = self.request.get('key')
        if not tz_offset or not key or not self.email:
            return False
        goal = TwoWeekGoal.get(key)
        if not goal:
            return False
        return True, goal.to_object(int(tz_offset))

    def handle_get_goals(self):
        tz_offset = self.request.get('tz_offset')
        count_limit = self.request.get('count_limit')
        if not tz_offset or not self.email or not count_limit:
            return False
        tz_offset = int(tz_offset)
        count_limit = int(count_limit)
        goals = TwoWeekGoal.query(self.email, count_limit)
        data = []
        for goal in goals:
            data.append(goal.to_object(tz_offset))
        return True, data

    def handle_update_goal(self):
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
            start_date = TimeUtil.str_to_utc_datetime(int(timezone_offset), start_date)
        if fulfill_status:
            fulfill_status = int(fulfill_status)
        return TwoWeekGoal.update(self.email, key, goal, start_date, fulfill_status)

    def handle_delete_goal(self):
        key = self.request.get('key')
        if not key or not self.email:
            return False
        return TwoWeekGoal.delete_instance(self.email, key)

    def handle_clear_goals(self):
        if not self.email:
            return False
        TwoWeekGoal.clear(self.email)
        return True
