var TestResult;
(function (TestResult) {
    TestResult[TestResult["Passed"] = 0] = "Passed";
    TestResult[TestResult["Failed"] = 1] = "Failed";
    TestResult[TestResult["Broken"] = 2] = "Broken";
    TestResult[TestResult["Ignored"] = 3] = "Ignored";
    TestResult[TestResult["Inconclusive"] = 4] = "Inconclusive";
    TestResult[TestResult["Unknown"] = 5] = "Unknown";
})(TestResult || (TestResult = {}));
//# sourceMappingURL=ghpr.controller.js.map