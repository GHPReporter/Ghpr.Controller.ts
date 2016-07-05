///<reference path="./../interfaces/ITestRun.ts"/>
///<reference path="./../enums/TestResult.ts"/>
///<reference path="./Color.ts"/>

class TestRunHelper {
    static getColor(test: ITestRun): string {
        const result = this.getResult(test);
        switch (result) {
            case TestResult.Passed:
                return Color.passed;
            case TestResult.Failed:
                return Color.failed;
            case TestResult.Broken:
                return Color.broken;
            case TestResult.Ignored:
                return Color.ignored;
            case TestResult.Inconclusive:
                return Color.inconclusive;
            default:
                return Color.unknown;
        }
    }

    static getResult(test: ITestRun): TestResult {
        if (test.result.indexOf("Passed") > -1) {
            return TestResult.Passed;
        }
        if (test.result.indexOf("Error") > -1) {
            return TestResult.Broken;
        }
        if (test.result.indexOf("Failed") > -1 || test.result.indexOf("Failure") > -1) {
            return TestResult.Failed;
        }
        if (test.result.indexOf("Inconclusive") > -1) {
            return TestResult.Inconclusive;
        }
        if (test.result.indexOf("Ignored") > -1 || test.result.indexOf("Skipped") > -1) {
            return TestResult.Ignored;
        }
        return TestResult.Unknown;
    }

    static getColoredResult(test: ITestRun): string {
        return `<span class="p-1" style= "background-color: ${this.getColor(test)};" > ${test.result} </span>`;
    }
    static getMessage(test: ITestRun): string {
        return test.testMessage === "" ? "-" : test.testMessage;
    }
}