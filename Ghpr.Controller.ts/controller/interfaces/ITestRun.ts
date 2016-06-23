///<reference path="./ITestScreenshot.ts"/>
///<reference path="./ITestEvent.ts"/>
///<reference path="./../enums/TestResult.ts"/>

interface ITestRun {
    name: string;
    fullName: string;
    testDuration: number;
    dateTimeStart: Date;
    dateTimeFinish: Date;
    testStackTrace: string;
    testMessage: string;
    result: string;
    output: string;
    testGuid: string;
    runGuid: string;
    screenshots: Array<ITestScreenshot>;
    events: Array<ITestEvent>;

    testRunColor: string;
    testResult: TestResult;
    failedOrBroken: boolean;
}