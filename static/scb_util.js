'use strict';

let $scb_util = {};

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
