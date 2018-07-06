Coding rules:
1. Backend is python, Frontend is javascript. Need two types of tests:
   One is python unit test, communicating with python http server, monitoring
   different behaviors. The other is webiste test, using nightwatch to setup
   whole website test.
2. The website should work on mobiles, using bootstrap.

Task design:

One: Make a two-week goal system.
backend: add data table (email, goal, start-date, end-date).
frontend: (1) Show current goal as the subtitle.
          (2) Add a TwoWeek Goal component to do three tasks:
              a. Mark whether you success or fail the goal each day.
              b. Add a new goal after two weeks. (Let the component button
                becomes red.)
              c. View past goals.

First need a register/login system.
  Can login with google account, or use a custom register/login system.

Two: Make a dairy system.
background: add data table (email, date, dairy)
frontend: (1) Add a page to show dairy history (in pages), add dairy, edit dairy.
          (2) Add a button reminding to add dairy for today.


Migrate from DailyNote2 DailyNote to SelfControlBoard Diary.

Suggestions:
1) User may happen to click the [delete] button in ListGoalHistory, add a confirm dailog. (done)


Third: Need a change remind logic. So changing in one computer can update content in another
computer. Like check update when page is activated.
