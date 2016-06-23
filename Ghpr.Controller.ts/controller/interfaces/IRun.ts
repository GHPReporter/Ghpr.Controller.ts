///<reference path="./IRunSummary.ts"/>

interface IRun {
    testRunFiles: Array<string>;
    guid: string;
    runSummary: IRunSummary;
    name: string;
    start: Date;
    finish: Date;
}