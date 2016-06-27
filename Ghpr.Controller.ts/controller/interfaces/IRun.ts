///<reference path="./IRunSummary.ts"/>
///<reference path="./IRunInfo.ts"/>

interface IRun {
    testRunFiles: Array<string>;
    runInfo: IRunInfo;
    summary: IRunSummary;
    name: string;
}