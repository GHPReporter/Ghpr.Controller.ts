var TestResult;
(function (TestResult) {
    TestResult[TestResult["Passed"] = 0] = "Passed";
    TestResult[TestResult["Failed"] = 1] = "Failed";
    TestResult[TestResult["Broken"] = 2] = "Broken";
    TestResult[TestResult["Ignored"] = 3] = "Ignored";
    TestResult[TestResult["Inconclusive"] = 4] = "Inconclusive";
    TestResult[TestResult["Unknown"] = 5] = "Unknown";
})(TestResult || (TestResult = {}));
var PageType;
(function (PageType) {
    PageType[PageType["TestRunsPage"] = 0] = "TestRunsPage";
    PageType[PageType["TestRunPage"] = 1] = "TestRunPage";
    PageType[PageType["TestPage"] = 2] = "TestPage";
})(PageType || (PageType = {}));
class JsonLoader {
    getRunPath(pt, guid) {
        switch (pt) {
            case PageType.TestRunsPage:
                return `./runs/run_${guid}.json`;
            case PageType.TestRunPage:
                return `./run_${guid}.json`;
            case PageType.TestPage:
                return `./../../runs/run_${guid}.json`;
            default:
                return "";
        }
    }
    loadJson(runGuid, pt, callback) {
        const path = this.getRunPath(pt, runGuid);
        console.log(path);
        const req = new XMLHttpRequest();
        req.overrideMimeType("application/json");
        req.open("get", path, true);
        req.onreadystatechange = () => {
            if (req.readyState === 4)
                if (req.status !== 200) {
                    console
                        .log(`Error while loading IRun .json data! Request status: ${req.status} : ${req.statusText}`);
                }
                else {
                    callback(req.responseText);
                }
        };
        req.timeout = 2000;
        req.ontimeout = () => {
            console.log(`Timeout while loading IRun .json data! Request status: ${req.status} : ${req.statusText}`);
        };
        req.send(null);
    }
    getRun(runGuid, pt) {
        let run;
        this.loadJson(runGuid, pt, (response) => {
            console.log("r: " + response);
            run = JSON.parse(response);
        });
        return run;
    }
    loadRun(runGuid, pt) {
        let run;
        const path = this.getRunPath(pt, runGuid);
        console.log(path);
        const req = new XMLHttpRequest();
        req.open("get", path, true);
        req.send();
        req.onreadystatechange = () => {
            if (req.readyState !== 4)
                return null;
            if (req.status !== 200) {
                console.log(`Error while loading IRun .json data! Request status: ${req.status} : ${req.statusText}`);
                return null;
            }
            else {
                run = JSON.parse(req.responseText);
                return run;
            }
        };
        req.timeout = 2000;
        return null;
    }
}
function logRun(guid, type) {
    const jl = new JsonLoader();
    console.log(jl.getRun(guid, type));
}
//# sourceMappingURL=ghpr.controller.js.map