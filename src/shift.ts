export class Shift {
    start: Date;
    end: Date;
    summary: string;

    constructor(start: Date, end: Date, summary: string) {
        this.start = start;
        this.end = end;
        this.summary = summary;
    }
}