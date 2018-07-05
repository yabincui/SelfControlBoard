'use strict';

let $scb_module = {};

$(document).ready(function() {

    class Module {
        constructor(id, name) {
            this.id = id;
            console.log('construct a module', name, 'with id', id);
            this.text = null;  // raw html content
            this.jobj = null;  // jquery instance
            this.children = new Map();
        }

        add(subModule) {
            this.children.set(subModule.id, subModule);
            if (this.jobj) {
                this.jobj.append(subModule.text);
                subModule.jobj = this.jobj.children().last();
                console.log('add module', subModule.id, subModule.jobj);
                subModule.onAdded();
            }
        }

        remove(subModule) {
            this.children.delete(subModule.id);
            if (this.jobj) {
                subModule.jobj.remove();
                console.log('remove module', subModule.id, subModule.jobj);
                subModule.jobj = null;
            }
        }

        onAdded() {
        }
    }

    class BodyModule extends Module {
        constructor() {
            super($scb_util.createId(), 'BodyModule');
            this.jobj = $('body');
            window.addEventListener('popstate', (event) => {
                this.reload();
            });
        }

        add(subModule) {
            console.log('add to body:', subModule.id);
            super.add(subModule);
        }

        remove(subModule) {
            console.log('remove from body:', subModule.id);
            super.remove(subModule);
        }

        reload() {
            for (let subModule of this.children.values()) {
                this.remove(subModule);
            }
            let body = this;
            $scb_util.getJson('/get_email', {}, function(data) {
                if (data == 'None') {
                    body.add(new HeaderModule(null));
                    $scb_util.urlControl.set('/', {});
                    body.add(new LoginRegisterModule());
                } else {
                    body.add(new HeaderModule(data));
                    let url = $scb_util.urlControl.url;
                    console.log('current url ', url);
                    if (url == '/') {
                        body.add(new MainModule());
                    } else if (url == '/twoweekgoal') {
                        body.add(new TwoWeekGoalModule());
                    } else if (url == '/diary') {
                        body.add(new DiaryModule());
                    }
                }
            });
        }
    }

    class HeaderModule extends Module {
        constructor(email) {
            super($scb_util.createId(), 'HeaderModule');
            this.text = $scb_ui.header.create(this.id, email);
            this.email = email;
        }

        onAdded() {
            this.jobj.find(`#${this.id}Logout`).click((event) => {
                $scb_util.loginEmailPasswd.set('', '', true);
                $scb_module.body.reload();
            });
            this.jobj.find(`#${this.id}Main`).click((event) => {
                event.preventDefault();
                $scb_util.urlControl.push('/');
                $scb_module.body.reload();
            });
            this.jobj.find(`#${this.id}TwoWeekGoal`).click((event) => {
                event.preventDefault();
                $scb_util.urlControl.push('/twoweekgoal');
                $scb_module.body.reload();
            });
            this.jobj.find(`#${this.id}Diary`).click((event) => {
                event.preventDefault();
                $scb_util.urlControl.push('/diary');
                $scb_module.body.reload();
            });
            if (this.email) {
                $scb_util.getJson('/twoweekgoal/get_goals',
                    {'tz_offset': $scb_util.date.getTimeZone(), 'count_limit': '1'}, (data) => {
                        if (!TwoWeekGoalModule.getCurrentGoal(data)) {
                            this.jobj.find(`#${this.id}NewGoalMark`).append('add new');
                        }
                    });
            }
        }
    }

    class LoginRegisterModule extends Module {
        constructor() {
            super($scb_util.createId(), 'LoginRegisterModule');
            this.text = $scb_ui.loginRegisterPage.create(this.id);
        }

        onAdded() {
            console.log('when login module is added');
            let loginButton = this.jobj.find(`#${this.id}LoginSubmit`);
            loginButton.click((event) => {
                event.preventDefault();
                let email = this.jobj.find(`#${this.id}LoginEmail`).val();
                let passwd = this.jobj.find(`#${this.id}LoginPasswd`).val();
                let save = this.jobj.find(`#${this.id}LoginSave`).val();
                $scb_util.loginEmailPasswd.set('', '', true);
                $scb_util.getJson('/login', {'email': email, 'passwd': passwd}, function(data) {
                    alert('Login successfully. ' + data);
                    $scb_util.loginEmailPasswd.set(email, passwd, save);
                    $scb_module['body'].reload();
                });
            });
            let registerButton = this.jobj.find(`#${this.id}RegisterSubmit`);
            registerButton.click((event) => {
                event.preventDefault();
                let email = this.jobj.find(`#${this.id}RegisterEmail`).val();
                let passwd = this.jobj.find(`#${this.id}RegisterPasswd`).val();
                $scb_util.loginEmailPasswd.set('', '', true);
                $scb_util.getJson('/register', {'email': email, 'passwd': passwd}, function(data) {
                    if (data == 'ok') {
                        alert('Register successfully, please go to confirm the registeration ' +
                              'email.');
                    } else {
                        alert('Open the url to confirm the registeration: ' + data);
                    }
                });
            });
        }
    }

    // MainPageModule, contains only the current two week goal.
    class MainModule extends Module {
        constructor() {
            super($scb_util.createId(), 'MainModule');
            this.text = $scb_ui.mainPage.create(this.id);
        }

        onAdded() {
            $scb_util.getJson('/twoweekgoal/get_goals',
                              {tz_offset: $scb_util.date.getTimeZone(), count_limit: 1},
                              (data) => this.onReceiveGoals(data));
        }

        onReceiveGoals(goals) {
            let cardId = this.id + 'TwoWeekGoal';
            let div = this.jobj.find(`#${cardId}`);
            let currentGoal = TwoWeekGoalModule.getCurrentGoal(goals);
            if (currentGoal == null) {
                div.append($scb_ui.mainPage.createMissingTwoWeekGoal(cardId + 'Missing'));
                let button = div.find(`#${cardId}Missing`);
                button.click((event) => {
                    $scb_util.urlControl.push('/twoweekgoal', {show: 'AddTwoWeekGoal'});
                    $scb_module.body.reload();
                });
            } else {
                div.append($scb_ui.mainPage.createTwoWeekGoal(cardId + 'Content', currentGoal));
                let goodMood = div.find(`#${cardId}ContentSuccess`);
                let badMood = div.find(`#${cardId}ContentFail`);
                let startDate = $scb_util.date.strToDate(currentGoal.start_date);
                let today = $scb_util.date.getToday();
                let dayDiff = $scb_util.date.getDayDiff(today, startDate);
                if (dayDiff < 0) {
                    dayDiff = 0;
                }
                let state = (currentGoal.fulfill_status >> (dayDiff * 2)) & 3;
                let oldStatus = currentGoal.fulfill_status & ~(3 << (dayDiff * 2));
                if (state == 1) {
                    goodMood.attr('fill', '#0f0');
                } else if (state == 2) {
                    badMood.attr('fill', '#f00');
                }
                let updateState = (state) => {
                    let status = oldStatus | (state << (dayDiff * 2));
                    $scb_util.getJson('/twoweekgoal/update_goal',
                            {key: currentGoal.key, goal: currentGoal.goal,
                             tz_offset: $scb_util.date.getTimeZone(), fulfill_status: status},
                            (data) => {});
                };

                goodMood.click((event) => {
                    if ($scb_util.date.getDayDiff($scb_util.date.getToday(), today) != 0) {
                        $scb_module.body.reload();
                        return;
                    }
                    let state = 0;
                    if (goodMood.attr('fill')) {
                        goodMood.attr('fill', '');
                    } else {
                        goodMood.attr('fill', '#0f0');
                        badMood.attr('fill', '');
                        state = 1;
                    }
                    updateState(state);
                });
                badMood.click((event) => {
                    if ($scb_util.date.getDayDiff($scb_util.date.getToday(), today) != 0) {
                        $scb_module.reload();
                        return;
                    }
                    let state = 0;
                    if (badMood.attr('fill')) {
                        badMood.attr('fill', '');
                    } else {
                        badMood.attr('fill', '#f00');
                        goodMood.attr('fill', '');
                        state = 2;
                    }
                    updateState(state);
                });
            }
        }
    }

    class TwoWeekGoalModule extends Module {
        constructor() {
            super($scb_util.createId(), "TwoWeekGoalModule");
            console.log('params', $scb_util.urlControl.params);
            let showParam = $scb_util.urlControl.params.get('show');
            if (!showParam) {
                showParam = 'AddTwoWeekGoal';
            }
            this.text = $scb_ui.twoWeekGoalPage.create(this.id, showParam);
        }

        onAdded() {
            let addCardId = this.id + 'AddTwoWeekGoal';
            let addCard = this.jobj.find(`#${addCardId}Body`);
            addCard.append($scb_ui.twoWeekGoalPage.createAddTwoWeekGoalForm(addCardId + "Form"));
            addCard.find(`#${addCardId}FormDatepicker`).datepicker({});
            addCard.find(`#${addCardId}FormCreate`).click((event) => {
                event.preventDefault();
                this.addGoalCallback();
            });
            $scb_util.getJson("/twoweekgoal/get_goals",
                {tz_offset: $scb_util.date.getTimeZone(), count_limit: -1},
                (data) => this.onReceiveGoals(data));
        }

        addGoalCallback() {
            let formId = this.id + 'AddTwoWeekGoalForm';
            let goal = this.jobj.find(`#${formId}Goal`).val();
            let dateStr = this.jobj.find(`#${formId}Datepicker`).val();
            console.log('create new goal', 'goal', goal, 'date', dateStr);
            if (!goal) {
                alert('Goal is empty.');
                return;
            }
            if (!dateStr) {
                alert('Start date is empty.');
                return;
            }
            let date = $scb_util.date.strToDate(dateStr);
            if (!date) {
                alert('Start date is invalid: ' + dateStr);
                return;
            }
            if ($scb_util.date.compareDay(date, $scb_util.date.getToday()) < 0) {
                alert('Please select a day no earlier than today.');
                return;
            }
            dateStr = $scb_util.date.dateToStr(date, true);
            $scb_util.getJson('/twoweekgoal/add_goal',
                {goal: goal, tz_offset: $scb_util.date.getTimeZone(), start_date: dateStr},
                (data) => {
                    $scb_util.urlControl.set('/twoweekgoal', {show: 'ListGoalHistory'});
                    $scb_module.body.reload();
            });
        }

        onReceiveGoals(goals) {
            this.addContentForUpdateCurrentGoal(goals);
            this.addContentForListGoalHistory(goals);
        }

        // Return current goal, or null if not exist.
        static getCurrentGoal(goals) {
            if (goals.length > 0) {
                let startDate = $scb_util.date.strToDate(goals[0].start_date);
                let endDate = $scb_util.date.addDay(startDate, 13);
                if ($scb_util.date.compareDay(endDate, $scb_util.date.getToday()) > 0) {
                    return goals[0];
                }
            }
            return null;
        }

        addContentForUpdateCurrentGoal(goals) {
            let updateCardId = this.id + 'UpdateCurrentGoal';
            let updateCard = this.jobj.find(`#${updateCardId}Body`);
            let currentGoal = TwoWeekGoalModule.getCurrentGoal(goals);
            if (currentGoal) {
                updateCard.append($scb_ui.twoWeekGoalPage.createUpdateGoalForm(
                    updateCardId + "Form", currentGoal));
                let value = currentGoal.fulfill_status;
                for (let i = 0; i < 14; ++i) {
                    let state = value & 3;
                    let goodMood = updateCard.find(`#${updateCardId}FormMood${i}`);
                    let badMood = updateCard.find(`#${updateCardId}FormBadMood${i}`);
                    if (state == 1) {
                        // Success
                        goodMood.attr('fill', '#0f0');
                    } else if (state == 2) {
                        // Fail
                        badMood.attr('fill', '#f00');
                    }
                    goodMood.click((event) => {
                        event.preventDefault();
                        if (goodMood.attr('fill')) {
                            goodMood.attr('fill', '');
                        } else {
                            goodMood.attr('fill', '#0f0');
                            badMood.attr('fill', '');
                        }
                    });
                    badMood.click((event) => {
                        event.preventDefault();
                        if (badMood.attr('fill')) {
                            badMood.attr('fill', '');
                        } else {
                            badMood.attr('fill', '#f00');
                            goodMood.attr('fill', '');
                        }
                    });
                    value >>= 2;
                }
                updateCard.find(`#${updateCardId}FormUpdate`).click((event) => {
                    event.preventDefault();
                    let content = updateCard.find(`#${updateCardId}FormGoal`).val();
                    let fulfill_status = 0;
                    for (let i = 13; i >= 0; --i) {
                        let goodMood = updateCard.find(`#${updateCardId}FormMood${i}`);
                        let badMood = updateCard.find(`#${updateCardId}FormBadMood${i}`);
                        let state = 0;
                        if (goodMood.attr('fill')) state = 1;
                        else if (badMood.attr('fill')) state = 2;
                        fulfill_status = (fulfill_status << 2) | state;
                    }
                    $scb_util.getJson('/twoweekgoal/update_goal',
                        {key: currentGoal.key, goal: content,
                         tz_offset: $scb_util.date.getTimeZone(),
                         start_date: currentGoal.start_date, fulfill_status: fulfill_status},
                        (data) => {
                            alert('Update successfully');
                            $scb_util.urlControl.set('/twoweekgoal', {show: 'UpdateCurrentGoal'});
                            $scb_module.body.reload();
                        });
                });

            } else {
                updateCard.append($scb_ui.twoWeekGoalPage.createMissingCurrentGoal(
                    updateCardId + "Missing"));
            }
        }

        addContentForListGoalHistory(goals) {
            let historyCardId = this.id + 'ListGoalHistory';
            let historyCard = this.jobj.find(`#${historyCardId}Body`);
            historyCard.append($scb_ui.twoWeekGoalPage.createGoalHistoryList(historyCardId + 'List',
                                    goals));
            for (let i = 0; i < goals.length; ++i) {
                let value = goals[i].fulfill_status;
                let baseId = historyCardId + `ListGoalState${i}`;
                for (let j = 0; j < 14; ++j) {
                    let state = value & 3;
                    value >>= 2;
                    if (state == 1) {
                        historyCard.find(`#${baseId}_${j}`).attr('fill', '#0f0');
                    } else if (state == 2) {
                        historyCard.find(`#${baseId}_${j}`).attr('fill', '#f00');
                    }
                }
            }
            let deleteModal = historyCard.find(`#${historyCardId}ListDeleteModal`);
            let deleteGoal = null;
            deleteModal.on('show.bs.modal', (event) => {
                let goalId = $(event.relatedTarget).data('goalid');
                deleteModal.find(`#${historyCardId}ListDeleteModalGoal`)
                    .text(goals[goalId].goal);
                deleteModal.find(`#${historyCardId}ListDeleteModalDelete`).click((event) => {
                    deleteGoal = goals[goalId];
                    deleteModal.modal('hide');
                });
            });
            deleteModal.on('hidden.bs.modal', (event) => {
                if (deleteGoal) {
                    $scb_util.getJson('/twoweekgoal/delete_goal', {key: deleteGoal.key},
                        (data) => {
                            $scb_util.urlControl.set('/twoweekgoal', {show: 'ListGoalHistory'});
                            $scb_module.body.reload();
                        });
                }
            });
        }
    }

    class DiaryModule extends Module {
        constructor() {
            super($scb_util.createId(), 'DiaryModule');
            this.text = $scb_ui.diaryPage.create(this.id);
        }

        onAdded() {
            this.onShowAddDiary();
            this.onShowDiaryList();
        }

        onShowAddDiary() {
            this.jobj.find(`#${this.id}AddDatepicker`).datepicker({});
            let diaryAdded = false;
            this.jobj.find(`#${this.id}AddModalAdd`).click((event) => {
                diaryAdded = this.addDiaryCallback();
            });
            this.jobj.find(`#${this.id}AddModal`).on('hidden.bs.modal', (event) => {
                if (diaryAdded) {
                    $scb_util.urlControl.set('/diary');
                    $scb_module.body.reload();
                }
            });
        }

        onShowDiaryList() {
            this.jobj.find(`#${this.id}ListStartDate`).datepicker({});
            this.jobj.find(`#${this.id}ListEndDate`).datepicker({});
            this.jobj.find(`#${this.id}ListMore`).hide();
            this.jobj.find(`#${this.id}ListShow`).click((event) => {
                this.showDiaryCallback();
            });
            let editModalId = this.id + 'ListEditModal';
            let editModal = this.jobj.find(`#${editModalId}`);
            let editButton = editModal.find(`#${editModalId}Update`);
            editModal.on('show.bs.modal', (event) => {
                let raiseButton = $(event.relatedTarget);
                let raiseId = raiseButton.attr('id');
                raiseId = raiseId.substr(0, raiseId.length - 4);
                let date = this.jobj.find(`#${raiseId}Date`).text();
                let diary = this.jobj.find(`#${raiseId}Diary`).val();
                let key = raiseButton.data('diary-key');
                editModal.find(`#${editModalId}Date`).empty().append(date);
                editModal.find(`#${editModalId}Content`).val(diary);
                editButton.data('diary-key', key);
                editButton.data('diary-div', raiseId);
            });
            editButton.click((event) => {
                let date = editModal.find(`#${editModalId}Date`).text();
                let diary = editModal.find(`#${editModalId}Content`).val();
                $scb_util.getJson('/diary/update_diary',
                    {tz_offset: $scb_util.date.getTimeZone(), 'key': editButton.data('diary-key'),
                     date: date, diary: diary}, (data) => {
                         this.jobj.find(`#${editButton.data('diary-div')}Diary`).empty()
                            .append(diary);
                         editModal.modal('hide');
                     });
            });

            let deleteModalId = this.id + 'ListDeleteModal';
            let deleteModal = this.jobj.find(`#${deleteModalId}`);
            let deleteButton = deleteModal.find(`#${deleteModalId}Delete`);
            deleteModal.on('show.bs.modal', (event) => {
                let raiseButton = $(event.relatedTarget);
                let raiseId = raiseButton.attr('id');
                raiseId = raiseId.substr(0, raiseId.length - 6);
                let date = this.jobj.find(`#${raiseId}Date`).text();
                let diary = this.jobj.find(`#${raiseId}Diary`).val();
                let key = raiseButton.data('diary-key');
                deleteModal.find(`#${deleteModalId}Date`).empty().append(date);
                deleteModal.find(`#${deleteModalId}Content`).empty().append(diary);
                deleteButton.data('diary-key', key);
                deleteButton.data('diary-div', raiseId);
            });
            deleteButton.click((event) => {
                $scb_util.getJson('/diary/delete_diary', {key: deleteButton.data('diary-key')},
                    (data) => {
                        this.jobj.find(`#${deleteButton.data('diary-div')}`).remove();
                        deleteModal.modal('hide');
                    });
            });
            this.showDiaryCallback();
        }

        addDiaryCallback() {
            let diary = this.jobj.find(`#${this.id}AddContent`).val();
            let dateStr = this.jobj.find(`#${this.id}AddDatepicker`).val();
            if (!diary) {
                alert('Diary is empty.');
                return false;
            }
            if (!dateStr) {
                alert('Please select date.');
                return false;
            }
            $scb_util.getJson('/diary/add_diary',
                {diary: diary, date: dateStr, tz_offset: $scb_util.date.getTimeZone()},
                (data) => {
                    this.jobj.find(`#${this.id}AddModal`).modal('hide');
                });
            return true;
        }

        showDiaryCallback() {
            let listId = this.id + 'List';
            let listDiv = this.jobj.find(`#${listId}`);
            listDiv.find(`#${listId}Body`).empty();
            let startDate = listDiv.find(`#${listId}StartDate`).val();
            let endDate = listDiv.find(`#${listId}EndDate`).val();
            let countPerShow = listDiv.find(`#${listId}CountPerShow`).val();
            this.getDiaries(startDate, endDate, countPerShow, null);
            let moreButton = listDiv.find(`#${listId}More`);
            moreButton.off('click');
            moreButton.click((event) => {
                this.getDiaries(startDate, endDate, countPerShow, moreButton.data('cursor'));
            });
        }

        getDiaries(startDate, endDate, countPerShow, cursor) {
            let req = {tz_offset: $scb_util.date.getTimeZone(), count_limit: countPerShow}
            if (startDate) {
                req.min_date = startDate;
            }
            if (endDate) {
                req.max_date = endDate;
            }
            if (cursor) {
                req.cursor = cursor;
            }
            $scb_util.getJson('/diary/get_diaries', req, (data) => {
                let diaries = data.data;
                let nextCursor = data.next_cursor;
                let listId = this.id + 'List';
                let listBody = this.jobj.find(`#${listId}Body`);
                for (let diary of diaries) {
                    listBody.append($scb_ui.diaryPage.createDiaryListItem(diary, listId));
                }
                let moreButton = this.jobj.find(`#${listId}More`);
                if (nextCursor) {
                    moreButton.data('cursor', nextCursor);
                    moreButton.show();
                } else {
                    moreButton.hide();
                }
            });
        }

    }


    $scb_module.body = new BodyModule();
});
