"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("./api");
var DaysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
var MonthsOfYear = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
var Roster = "\nRoster\nRoster for Period: 05 Apr 2021 - 11 Apr 2021\n\nEmployee 914 Edward Jones\nMonday (05 Apr)\nDaily Total Hours: 0\n\nTuesday (06 Apr)\nDaily Total Hours: 0\n\nWednesday (07 Apr)\n1800 - 2200 SK Floor Attendant\n2230 - 2615 SK Floor Attendant\nDaily Total Hours: 7.75\n\nThursday (08 Apr)\nDaily Total Hours: 0\n\nFriday (09 Apr)\n1700 - 2130 SK Cove Bar\nDaily Total Hours: 4.5\n\nSaturday (10 Apr)\n1230 - 1600 SK Main Bar\n1630 - 2130 SK Main Bar\nDaily Total Hours: 8.5\n\nSunday (11 Apr)\n1715 - 2100 SK Cove Bar\nDaily Total Hours: 3.75\n\nWeekly Total Hours: 24.5 \n";
var Shift = /** @class */ (function () {
    function Shift(start, end, summary) {
        this.start = start;
        this.end = end;
        this.summary = summary;
    }
    return Shift;
}());
var Day = /** @class */ (function () {
    function Day() {
        this.shifts = [];
    }
    Day.prototype.addShift = function (shift) {
        this.shifts.push(shift);
    };
    return Day;
}());
var RosterSections = Roster.split("\n\n").filter(function (section) {
    return DaysOfWeek.map(function (dayOfWeek) { return section.includes(dayOfWeek); }).some(function (bool) { return bool; });
});
var Days = RosterSections.map(function (rosterSection) {
    // Figure out day this shift is on
    var DateString = String(/(?<=\().+?(?=\))/g.exec(rosterSection));
    var _a = DateString.split(" "), DayString = _a[0], MonthString = _a[1];
    var DayNumber = Number(DayString);
    var MonthNumber = Number(MonthsOfYear.indexOf(MonthString));
    // Figure out the time of each shift for this day
    var ShiftStrings = rosterSection.split("\n").filter(function (rosterSectionLine) { return rosterSectionLine.includes(" - "); });
    var Shifts = ShiftStrings.map(function (shiftString) {
        var TimeString = String(/(?:\S+\s)?\S*-\S*(?:\s\S+)?/g.exec(shiftString));
        var _a = TimeString.split(" - "), StartString = _a[0], EndString = _a[1];
        var StartHours = Number(StartString.slice(0, 2));
        var StartMinutes = Number(StartString.slice(2, 4));
        var EndHours = Number(EndString.slice(0, 2));
        var EndMinutes = Number(EndString.slice(2, 4));
        var StartDate = new Date(2021, MonthNumber, DayNumber, StartHours, StartMinutes);
        var EndDate = new Date(2021, MonthNumber, DayNumber, EndHours, EndMinutes);
        var ShiftTitleRegex = /([^\d\W]+ *)+/g.exec(shiftString);
        var ShiftTitle = String(ShiftTitleRegex && ShiftTitleRegex[0]).trim();
        return new Shift(StartDate, EndDate, ShiftTitle);
    });
    var DayInstance = new Day();
    Shifts.forEach(function (shift) { return DayInstance.addShift(shift); });
    return DayInstance;
});
api_1.createEventsFromDays(Days);
