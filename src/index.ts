import fs from 'fs';
import { createEventsFromDays } from './api';
import MonthsOfYear from './months';
import DaysOfWeek from './days';
import { WorkDay } from './workday';
import { Shift } from './shift';

fs.readFile('Roster.txt', 'utf8', (err: NodeJS.ErrnoException | null, Roster: string) => {
  if (err) {
    console.log("Couldn't find Roster.txt");
    return;
  }

  const RosterSections = Roster.split('\n\n').filter((section) => DaysOfWeek.map((dayOfWeek) => section.includes(dayOfWeek)).some(
    (bool) => bool,
  ));

  const Days = RosterSections.map((rosterSection) => {
    // Figure out day this shift is on
    const DateString = String(/(?<=\().+?(?=\))/g.exec(rosterSection));
    const [DayString, MonthString] = DateString.split(' ');
    const DayNumber = Number(DayString);
    const MonthNumber = Number(MonthsOfYear.indexOf(MonthString));

    // Figure out the time of each shift for this day
    const ShiftStrings = rosterSection.split('\n').filter((rosterSectionLine) => rosterSectionLine.includes(' - '));
    const Shifts = ShiftStrings.map((shiftString) => {
      const TimeString = String(/(?:\S+\s)?\S*-\S*(?:\s\S+)?/g.exec(shiftString));
      const [StartString, EndString] = TimeString.split(' - ');
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
});
