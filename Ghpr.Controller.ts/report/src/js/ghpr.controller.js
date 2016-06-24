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
class DateFormatter {
    static format(date) {
        const year = `${date.getFullYear()}`;
        const month = this.correct(`${date.getMonth() + 1}`);
        const day = this.correct(`${date.getDate()}`);
        const hour = this.correct(`${date.getHours()}`);
        const minute = this.correct(`${date.getMinutes()}`);
        const second = this.correct(`${date.getSeconds()}`);
        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    }
    static diff(start, finish) {
        const timeDifference = (finish.getTime() - start.getTime());
        const dDate = new Date(timeDifference);
        const dHours = dDate.getUTCHours();
        const dMins = dDate.getUTCMinutes();
        const dSecs = dDate.getUTCSeconds();
        const dMilliSecs = dDate.getUTCMilliseconds();
        const readableDifference = dHours + ":" + dMins + ":" + dSecs + "." + dMilliSecs;
        return readableDifference;
    }
    static correct(s) {
        if (s.length === 1) {
            return `0${s}`;
        }
        else
            return s;
    }
}
class Color {
}
Color.passed = "#8bc34a";
Color.broken = "#ffc107";
Color.failed = "#ef5350";
Color.ignored = "#81d4fa";
Color.inconclusive = "#D6FAF7";
Color.unknown = "#bdbdbd";
class RunPageUpdater {
    static updateTime(run) {
        document.getElementById("start").innerHTML += DateFormatter.format(run.start);
        document.getElementById("finish").innerHTML += DateFormatter.format(run.finish);
        document.getElementById("duration").innerHTML += DateFormatter.diff(run.start, run.finish);
    }
    static updateSummary(run) {
        const s = run.summary;
        document.getElementById("total").innerHTML += s.total;
        document.getElementById("passed").innerHTML += s.success;
        document.getElementById("broken").innerHTML += s.errors;
        document.getElementById("failed").innerHTML += s.failures;
        document.getElementById("inconclusive").innerHTML += s.inconclusive;
        document.getElementById("ignored").innerHTML += s.ignored;
        document.getElementById("unknown").innerHTML += s.unknown;
        const pieDiv = document.getElementById("summary-pie");
        Plotly.plot(pieDiv, [
            {
                values: [s.success, s.errors, s.failures, s.inconclusive, s.ignored, s.unknown],
                labels: ["Passed", "Broken", "Failed", "Inconclusive", "Ignored", "Unknown"],
                marker: {
                    colors: [
                        Color.passed, Color.broken, Color.failed, Color.inconclusive, Color.ignored, Color.unknown],
                    line: {
                        color: "white",
                        width: 2
                    }
                },
                outsidetextfont: {
                    family: "Helvetica, arial, sans-serif"
                },
                textfont: {
                    family: "Helvetica, arial, sans-serif"
                },
                textinfo: "label+percent",
                type: "pie",
                hole: 0.35
            }
        ], {
            margin: { t: 0 }
        });
    }
    static updateRunPage(runGuid) {
        let run;
        var loader = new JsonLoader();
        loader.loadJson(runGuid, PageType.TestRunPage, (response) => {
            run = JSON.parse(response, loader.reviveRun);
            RunPageUpdater.updateTime(run);
            RunPageUpdater.updateSummary(run);
        });
        return run;
    }
}
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
    reviveRun(key, value) {
        if (key === "start" || key === "finish")
            return new Date(value);
        return value;
    }
}
class FilesGetter {
    static getRuns() {
        return null;
    }
}
function loadRun(guid) {
    RunPageUpdater.updateRunPage(guid);
}
function loadFirstRun(guid) {
    const runs = FilesGetter.getRuns();
    RunPageUpdater.updateRunPage(runs[1]);
}
//# sourceMappingURL=ghpr.controller.js.map