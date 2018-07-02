'use strict';

let $scb_util = {};
let $scb_ui = {};
let $scb_module = {};

$(document).ready(function() {

    function getJson(url, argumentDict, successCallback) {
        if ($scb_util.loginEmailPasswd.email) {
            argumentDict['email'] = $scb_util.loginEmailPasswd.email;
            argumentDict['passwd'] = $scb_util.loginEmailPasswd.passwd;
        }
        $.getJSON(url, argumentDict, function(data) {
            console.log('getJson url ', url, ', data: ', data);
            if (data.status == 'error') {
                alert(`Call ${url} failed: ${data.msg}.`);
            } else {
                successCallback(data.msg);
            }
        }).fail(function() {
            alert(`Failed to call ${url}.`);
        });
    }

    let currentId = 0;
    function createId() {
        return `uid${++currentId}`;
    }

    function formatInt(n, space) {
        let a = `${n}`;
        return '0'.repeat(space - a.length) + a;
    }

    class DateUtil {
        constructor() {
            let d = new Date();
            let n = d.getTimezoneOffset();
            this.timeZone = -n / 60;
        }

        getTimeZone() {
            return this.timeZone;
        }

        getToday() {
            return new Date();
        }

        // Return in format 'year/month/day/hour/minute/second'.
        dateToStr(date, withHours) {
            let s = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
            if (withHours) {
                s += `/${date.getHours()}/${date.getMinutes()}/${date.getSeconds()}`;
            }
            return s;
        }

        // s should be in format 'year/month/day[/hour/minute/second]'.
        strToDate(s) {
            let items = s.split('/');
            if (items.length < 3) return null;
            let year = parseInt(items[0], 10);
            let month = parseInt(items[1], 10);
            let day = parseInt(items[2], 10);
            let hours = 0;
            let minutes = 0;
            let seconds = 0;
            if (items.length == 6) {
                hours = parseInt(items[3], 10);
                minutes = parseInt(items[4], 10);
                seconds = parseInt(items[5], 10);
            }
            if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes) ||
                    isNaN(seconds) || month < 1 || day > 31 || hours > 23 || minutes > 59 ||
                    seconds > 59) {
                return null;
            }
            return new Date(year, month - 1, day, hours, minutes, seconds);
        }

        compareDay(date1, date2) {
            if (date1.getFullYear() != date2.getFullYear()) {
                return date1.getFullYear() - date2.getFullYear();
            }
            if (date1.getMonth() != date2.getMonth()) {
                return date1.getMonth() - date2.getMonth();
            }
            return date1.getDate() - date2.getDate();
        }

        addDay(date, day) {
            return new Date(date.valueOf() + day * 24 * 60 * 60 * 1000);
        }

        getDayDiff(date1, date2) {
            date1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
            date2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
            let result = (date1 - date2) / 24 / 60 / 60 / 1000;
            console.log('date1', date1, 'date2', date2, 'dayDiff', result);
            return result;
        }
    }

    class UrlControl {
        constructor() {
            this.refresh();
            window.addEventListener('popstate', (event) => {
                this.refresh();
            });
        }

        refresh() {
            let url = window.location.href;
            let strs = url.split('?')
            let items = strs[0].split('/');
            this.url = '/' + items[items.length - 1];
            this.params = new Map();
            if (strs.length == 2) {
                strs = strs[1].split('&');
                for (let s in strs) {
                    let items = s.split('=');
                    if (items.length != 2) continue;
                    let name = decodeURIComponent(items[0]);
                    let value = decodeURIComponent(items[1]);
                    this.params.set(name, value);
                }
            }
        }

        push(url, params) {
            let completeUrl = this._set(url, params);
            history.pushState({}, "", completeUrl);
        }

        set(url, params) {
            let completeUrl = this._set(url, params);
            history.replaceState({}, "", completeUrl);
        }

        _set(url, params) {
            this.url = url;
            this.params = new Map();
            for (let key in params) {
                this.params.set(key, params[key]);
            }
            let completeUrl = url;
            if (this.params.size > 0) {
                completeUrl += '?';
                let first = true;
                for (let [key, value] of this.params) {
                    if (first) first = false;
                    else completeUrl += '&';
                    completeUrl += encodeURIComponent(key) + '=' + encodeURIComponent(value);
                }
            }
            return completeUrl;
        }
    }

    class Cookie {
        constructor() {
            this.map = this._getAll();
        }

        get(name) {
            return this.map.get(name);
        }

        // Return a map mapping from name to value.
        getAll() {
            return this.map;
        }

        _getAll() {
            let map = new Map();
            let cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; ++i) {
                let strs = cookies[i].split('=');
                console.log(`cookies[${i}] = ${cookies[i]}`, strs);
                if (strs.length != 2) continue;
                let cookieName = $.trim(decodeURIComponent(strs[0]));
                let cookieValue = $.trim(decodeURIComponent(strs[1]));
                map.set(cookieName, cookieValue);
            }
            return map;
        }

        set(name, value, persistSave) {
            this.map[name] = value;
            let cookieStr = encodeURIComponent(name) + '=' + encodeURIComponent(value);
            if (persistSave) {
                cookieStr += '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
            }
            document.cookie = cookieStr;
        }
    }

    class LoginEmailPasswd {
        constructor() {
            this.email = $scb_util.cookie.get('email');
            this.passwd = $scb_util.cookie.get('passwd');
        }

        set(email, passwd, persistSave) {
            this.email = email;
            this.passwd = passwd;
            $scb_util.cookie.set('email', email, persistSave);
            $scb_util.cookie.set('passwd', passwd, persistSave);
        }
    }

    $scb_util.getJson = getJson;
    $scb_util.createId = createId;
    $scb_util.formatInt = formatInt;
    $scb_util.date = new DateUtil();
    $scb_util.urlControl = new UrlControl();
    $scb_util.cookie = new Cookie();
    $scb_util.loginEmailPasswd = new LoginEmailPasswd();
});

$(document).ready(function() {

    class SvgIcons {
        mood(id) {
            return `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="${id}">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
</svg>
            `;
        }

        bad_mood(id) {
            return `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="${id}">
                <path fill="none" d="M0 0h24v24H0V0z"/>
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 3c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z"/>
            </svg>
            `;
        }
    }

    class Header {

        create(id, email) {
            let add_new_goal_mark =
                `<sup class="text-danger" id="${id}NewGoalMark"></sup>`;
            let str = `
                <nav class="navbar navbar-expand-md navbar-light bg-light" id="${id}Nav">
                    <a class="navbar-brand" href="#" id="${id}Main">SelfControlBoard</a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#${id}headerNavbar" aria-controls="${id}headerNavbar"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="${id}headerNavbar">
                        <ul class="navbar-nav mr-auto">
                            <li class="nav-item active">
                                <a class="nav-link" href="#" id="${id}TwoWeekGoal"
                                    >TwoWeekGoal${add_new_goal_mark}</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#${id}Others">Others</a>
                            </li>
                        </ul>
                        <span class="navbar-text">${email ? email : ''}&nbsp;</span>
                        <button class="btn btn-outline-success" id="${id}Logout">Logout</button>
                    </div>
                </nav>
                <hr/>
            `;
            return `<div id="${id}">${str}</div>`;
        }
    }

    class LoginRegisterPage {
        create(id) {
            function createLoginRegisterForm(id) {
                let saveCheckbox = '';
                if (id.endsWith('Login')) {
                    saveCheckbox = `<div class="form-check">
                                <input type="checkbox" class="form-check-input" id="${id}Save">
                                <label class="form-check-label" for="${id}Save">Save passwd on
                                this computer</label>
                                </div>`;
                }
                return `<form>
                            <div class="form-group">
                                <label for="${id}Email">Email address</label>
                                <input type="email" class="form-control" id="${id}Email"
                                    placeholder="Enter email">
                            </div>
                            <div class="form-group">
                                <label for="${id}Passwd">Password</label>
                                <input type="password" class="form-control" id="${id}Passwd"
                                    placeholder="Password">
                            </div>
                            ${saveCheckbox}
                            <button type="submit" class="btn btn-primary" id="${id}Submit">Submit
                            </button>
                        </form>
                `;
            }
            let str = `
                <div>
                    <ul class="nav nav-pills mb-3" id="${id}-tab" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" id="${id}Login-tab" data-toggle="pill"
                                href="#${id}Login" role="tab" aria-controls="${id}Login"
                                aria-selected="true">Login</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="${id}Register-tab" data-toggle="pill"
                                href="#${id}Register" role="tab" aria-controls="${id}Register"
                                aria-selected="false">Register</a>
                        </li>
                    </ul>
                    <div class="tab-content" id="${id}-tabContent">
                        <div class="tab-pane show active" id="${id}Login" role="tabpanel"
                            aria-labelledby="${id}Login-tab">
                            ${createLoginRegisterForm(id + "Login")}
                        </div>
                        <div class="tab-pane" id="${id}Register" role="tabpanel"
                            aria-labelledby="${id}Register-tab">
                            ${createLoginRegisterForm(id + "Register")}
                        </div>
                    </div>
                </div>
            `;
            return `
                <div class="container" id="${id}">
                    <div class="row justify-content-center">${str}</div>
                </div>
            `;
        }
    }

    class MainPage {

        create(id) {
            let str = `
            <div class="card">
                <div class="card-body" id="${id}TwoWeekGoal">
                    <h5 class="card-title">Two Week Goal</h5>
                </div>
            </div>
            `;
            return `<div id="${id}">${str}</div>`;
        }

        createTwoWeekGoal(id, goal) {
            let date = $scb_util.date.getToday();
            let startDate = $scb_util.date.strToDate(goal.start_date);
            if ($scb_util.date.getDayDiff(date, startDate) < 0) {
                date = startDate;
            }
            let dateStr = $scb_util.date.dateToStr(date, false);
            return `
                <div id="${id}">
                    <p class="card-text" id="${id}Text">${goal.goal}</p>
                    <p class="card-text">${dateStr}
                        ${$scb_ui.svgIcons.mood(id + 'Success')}
                        ${$scb_ui.svgIcons.bad_mood(id + 'Fail')}
                    </p>
                </div>
            `;
        }

        createMissingTwoWeekGoal(id) {
            return `
                <button type="button" class="btn btn-primary" id="${id}">
                    Can't wait to create a Two week goal!
                </button>
            `;
        }
    }

    class TwoWeekGoalPage {
        create(id, showParam) {
            return `
                <div class="accordion" id="${id}">
                    ${this.createAccordionCard(id, id + "AddTwoWeekGoal", "Add New TwoWeekGoal",
                        showParam == 'AddTwoWeekGoal')}
                    ${this.createAccordionCard(id, id + "UpdateCurrentGoal", "Update Current Goal",
                        showParam == 'UpdateCurrentGoal')}
                    ${this.createAccordionCard(id, id + "ListGoalHistory", "List Goal History",
                        showParam == 'ListGoalHistory')}
                </div>
            `;
        }

        createAccordionCard(parentId, id, name, active) {
            return `
                <div class="card">
                    <div class="card-header" id="${id}Head">
                        <h5 class="mb-0">
                            <button class="btn btn-link" type="button" data-toggle="collapse"
                                data-target="#${id}" aria-expanded="${active ? "true" : "false"}"
                                aria-controls="${id}">${name}</button>
                        </h5>
                    </div>
                    <div id="${id}" class="collapse ${active ? "show" : ""}"
                        aria-labelledby="${id}HEAD" data-parent="#${parentId}">
                        <div class="card-body" id="${id}Body"></div>
                    </div>
                </div>
            `;
        }

        createAddTwoWeekGoalForm(id) {
            return `
                <form id="${id}">
                    <div class="form-group">
                        <label for="${id}Goal">Please enter the goal:</label>
                        <textarea class="form-control" id="${id}Goal" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="${id}Datepicker">Select Start date:</label>
                        <input id="${id}Datepicker" data-date-format="yyyy/mm/dd"
                            data-date-start-date="0d" type="text"/>
                    </div>
                    <button type="submit" class="btn btn-primary" id="${id}Create">Create</button>
                </form>
            `;
        }

        createUpdateGoalForm(id, goal) {

            let checkDoneStatus = () => {
                let startDate = $scb_util.date.strToDate(goal.start_date);
                let result = '';
                for (let i = 0; i < 14; ++i) {
                    let date = $scb_util.date.addDay(startDate, i);
                    let month = $scb_util.formatInt(date.getMonth() + 1, 2);
                    let day = $scb_util.formatInt(date.getDate(), 2);
                    result += `
                        <div class="col-sm-12 col-md-6 col-lg-4 col-xl-3">
                            <div class="container">
                                <div class="row">
                                    <div class="col-4">${month+'/'+day}</div>
                                    <div class="col-4">
                                        ${$scb_ui.svgIcons.mood(id + 'Mood' + i)}
                                    </div>
                                    <div class="col-4">
                                        ${$scb_ui.svgIcons.bad_mood(id + 'BadMood' + i)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
                return `<div class="container">
                            <div class="row">
                            ${result}
                            </div>
                        </div>
                        `;
            };
            let content = goal.goal;
            return `
                <form id="${id}">
                    <div class="form-group">
                        <label for="${id}Goal">Update goal:</label>
                        <textarea class="form-control" id="${id}Goal" row="3">${content}</textarea>
                    </div>
                    <div class="form-group">
                        ${checkDoneStatus()}
                    </div>
                    <button type="submit" class="btn btn-primary" id="${id}Update">Update</button>
                </form>
            `;
        }

        createMissingCurrentGoal(id) {
            return `<p id="${id}">No current goal to update.</p>`;
        }

        createGoalHistoryList(id, goals) {
            let createGoal = (i) => {
                let startDate = $scb_util.date.strToDate(goals[i].start_date);
                let endDate = $scb_util.date.addDay(startDate, 13);
                let dateStr = $scb_util.date.dateToStr(startDate, false) + ' - ' +
                                $scb_util.date.dateToStr(endDate, false);
                let value = goals[i].fulfill_status;
                let stateView = '';
                for (let j = 0; j < 14; ++j) {
                    let state = value & 3;
                    value >>= 2;
                    if (state < 2) {
                        stateView += $scb_ui.svgIcons.mood(`${id}GoalState${i}_${j}`);
                    } else {
                        stateView += $scb_ui.svgIcons.bad_mood(`${id}GoalState${i}_${j}`);
                    }
                }
                return `
                    <div class="list-group-item flex-column align-items-start">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${dateStr}</h5>
                            <button type="button" class="btn btn-outline-warning btn-sm"
                                id="${id}Delete${i}">Delete</button>
                        </div>
                        <p class="mb-2">${goals[i].goal}</p>
                        <p class="mb-0">${stateView}
                        </p>
                    </div>
                `;
            };
            let str = '';
            for (let i = 0; i < goals.length; ++i) {
                str += createGoal(i);
            }
            return `
                <div class="list-group" id="${id}">
                    ${str}
                </div>
            `;
        }
    }

    $scb_ui.svgIcons = new SvgIcons();
    $scb_ui.header = new Header();
    $scb_ui.loginRegisterPage = new LoginRegisterPage();
    $scb_ui.mainPage = new MainPage();
    $scb_ui.twoWeekGoalPage = new TwoWeekGoalPage();
});

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
                            (data) => { $scb_module.body.reload(); });
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
                historyCard.find(`#${historyCardId}ListDelete${i}`).click((event) => {
                    $scb_util.getJson('/twoweekgoal/delete_goal', {key: goals[i].key}, (data) => {
                        $scb_util.urlControl.set('/twoweekgoal', {show: 'ListGoalHistory'});
                        $scb_module.body.reload();
                    });
                });
            }
        }
    }

    // TwoWeekGoalModule, contains two week goals.

    $scb_module.body = new BodyModule();
});

$(document).ready(function() {

    let body = $scb_module.body;
    body.reload();

});
