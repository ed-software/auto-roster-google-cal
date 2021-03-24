import { createEventsFromDays } from './api';
import MonthsOfYear from './months';
import DaysOfWeek from './days';
import { WorkDay } from './workday';
import { Shift } from './shift';

let Roster = `
Roster
Roster for Period: 05 Apr 2021 - 11 Apr 2021

Employee 914 Edward Jones
Monday (05 Apr)
Daily Total Hours: 0

Tuesday (06 Apr)
Daily Total Hours: 0

Wednesday (07 Apr)
1800 - 2200 SK Floor Attendant
2230 - 2615 SK Floor Attendant
Daily Total Hours: 7.75

Thursday (08 Apr)
Daily Total Hours: 0

Friday (09 Apr)
1700 - 2130 SK Cove Bar
Daily Total Hours: 4.5

Saturday (10 Apr)
1230 - 1600 SK Main Bar
1630 - 2130 SK Main Bar
Daily Total Hours: 8.5

Sunday (11 Apr)
1715 - 2100 SK Cove Bar
Daily Total Hours: 3.75

Weekly Total Hours: 24.5 
`;


const RosterSections = Roster.split("\n\n").filter((section) =>
  DaysOfWeek.map((dayOfWeek) => section.includes(dayOfWeek)).some(
      (bool) => bool
    )
);
const Days = RosterSections.map((rosterSection) => {
    // Figure out day this shift is on
    const DateString = String(/(?<=\().+?(?=\))/g.exec(rosterSection));
    const [DayString, MonthString] = DateString.split(" ");
    const DayNumber = Number(DayString);
    const MonthNumber = Number(MonthsOfYear.indexOf(MonthString));

    // Figure out the time of each shift for this day
    const ShiftStrings = rosterSection.split("\n").filter((rosterSectionLine) => rosterSectionLine.includes(" - "));
    const Shifts = ShiftStrings.map((shiftString) => {
        const TimeString = String(/(?:\S+\s)?\S*-\S*(?:\s\S+)?/g.exec(shiftString));
        const [StartString, EndString] = TimeString.split(" - ");
        const StartHours = Number(StartString.slice(0, 2));
        const StartMinutes = Number(StartString.slice(2, 4));
        const EndHours = Number(EndString.slice(0, 2));
        const EndMinutes = Number(EndString.slice(2, 4));
        const StartDate = new Date(2021, MonthNumber, DayNumber, StartHours, StartMinutes);
        const EndDate = new Date(2021, MonthNumber, DayNumber, EndHours, EndMinutes);
        const ShiftTitleRegex = /([^\d\W]+ *)+/g.exec(shiftString);
        const ShiftTitle = String(ShiftTitleRegex && ShiftTitleRegex[0]).trim();
        return new Shift(StartDate, EndDate, ShiftTitle);
    });

    const DayInstance = new WorkDay();
    Shifts.forEach((shift) => DayInstance.addShift(shift));
    return DayInstance;
});

createEventsFromDays(Days);