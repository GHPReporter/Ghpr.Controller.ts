///<reference path="./IRunSummary.ts"/>

interface IRun {
    testRunFiles: Array<string>;
    guid: string;
    summary: IRunSummary;
    name: string;
    start: Date;
    finish: Date;
}