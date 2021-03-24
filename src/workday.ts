import { Shift } from './shift';

export class WorkDay {
    shifts: Shift[] = [];
  
    addShift(shift: Shift) {
      this.shifts.push(shift);
    }
  }