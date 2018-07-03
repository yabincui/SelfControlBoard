'use strict';

let $scb_ui = {};

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
                                data-toggle="modal" data-target="#${id}DeleteModal"
                                data-goalid="${i}">Delete</button>
                        </div>
                        <p class="mb-2">${goals[i].goal}</p>
                        <p class="mb-0">${stateView}
                        </p>
                    </div>
                `;
            };
            let createDeleteModal = () => {
                let mId = id + "DeleteModal";
                return `
                    <div class="modal fade" id="${mId}" tabindex="-1" role="dailog"
                        aria-labelledby="${mId}Label" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="${mId}Label"
                                        >Are you sure to delete the goal?</h5>
                                    <button type="button" class="close" data-dismiss="modal"
                                        aria-label="Close"><span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <p id="${mId}Goal"></p>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-warning" id="${mId}Delete"
                                        >Delete</button>
                                    <button type="button" class="btn btn-primary"
                                        data-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            };
            let str = '';
            for (let i = 0; i < goals.length; ++i) {
                str += createGoal(i);
            }
            return `
                <div id="${id}">
                    <div class="list-group">${str}</div>
                    ${createDeleteModal()}
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
