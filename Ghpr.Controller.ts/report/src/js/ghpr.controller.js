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
class PathsHelper {
    static getRunPath(pt, guid) {
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
    static getRunsPath(pt) {
        switch (pt) {
            case PageType.TestRunsPage:
                return `./runs/runs.json`;
            case PageType.TestRunPage:
                return `./runs.json`;
            case PageType.TestPage:
                return `./../../runs/runs.json`;
            default:
                return "";
        }
    }
}
class TabsHelper {
    static showTab(idToShow, caller, pageTabsIds) {
        if (pageTabsIds.indexOf(idToShow) <= -1) {
            return;
        }
        const tabs = document.getElementsByClassName("tabnav-tab");
        for (let i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove("selected");
        }
        caller.className += " selected";
        pageTabsIds.forEach((id) => {
            document.getElementById(id).style.display = "none";
        });
        document.getElementById(idToShow).style.display = "";
    }
}
class UrlHelper {
    static insertParam(key, value) {
        const paramsPart = document.location.search.substr(1);
        window.history.pushState("", "", "");
        const p = `${key}=${value}`;
        if (paramsPart === "") {
            window.history.pushState("", "", `?${p}`);
        }
        else {
            let params = paramsPart.split("&");
            const paramToChange = params.find((par) => par.split("=")[0] === key);
            if (paramToChange != undefined) {
                if (params.length === 1) {
                    params = [p];
                }
                else {
                    const index = params.indexOf(paramToChange);
                    params.splice(index, 1);
                    params.push(p);
                }
            }
            window.history.pushState("", "", `?${params.join("&")}`);
        }
    }
    static getParam(key) {
        const paramsPart = document.location.search.substr(1);
        if (paramsPart === "") {
            return "";
        }
        else {
            const params = paramsPart.split("&");
            const paramToGet = params.find((par) => par.split("=")[0] === key);
            if (paramToGet != undefined) {
                return paramToGet.split("=")[1];
            }
            else
                return "";
        }
    }
}
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
        document.getElementById("start").innerHTML = `Start datetime: ${DateFormatter.format(run.runInfo.start)}`;
        document.getElementById("finish").innerHTML = `Finish datetime: ${DateFormatter.format(run.runInfo.finish)}`;
        document.getElementById("duration").innerHTML = `Duration: ${DateFormatter.diff(run.runInfo.start, run.runInfo.finish)}`;
    }
    static updateName(run) {
        document.getElementById("run-name").innerHTML = run.name;
    }
    static updateSummary(run) {
        const s = run.summary;
        document.getElementById("total").innerHTML = `Total: ${s.total}`;
        document.getElementById("passed").innerHTML = `Success: ${s.success}`;
        document.getElementById("broken").innerHTML = `Errors: ${s.errors}`;
        document.getElementById("failed").innerHTML = `Failures: ${s.failures}`;
        document.getElementById("inconclusive").innerHTML = `Inconclusive: ${s.inconclusive}`;
        document.getElementById("ignored").innerHTML = `Ignored: ${s.ignored}`;
        document.getElementById("unknown").innerHTML = `Unknown: ${s.unknown}`;
        const pieDiv = document.getElementById("summary-pie");
        Plotly.newPlot(pieDiv, [
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
        var loader = new JsonLoader(PageType.TestRunPage);
        loader.loadRunJson(runGuid, (response) => {
            run = JSON.parse(response, loader.reviveRun);
            UrlHelper.insertParam("runGuid", run.runInfo.guid);
            RunPageUpdater.updateTime(run);
            RunPageUpdater.updateSummary(run);
            RunPageUpdater.updateName(run);
        });
        return run;
    }
    static loadRun(index = undefined) {
        let runInfos;
        var loader = new JsonLoader(PageType.TestRunPage);
        loader.loadRunsJson((response) => {
            runInfos = JSON.parse(response, loader.reviveRun);
            this.runsCount = runInfos.length;
            if (index === undefined || index.toString() === "NaN") {
                index = this.runsCount - 1;
                this.currentRun = index;
            }
            if (index === 0) {
                this.disableBtn("btn-prev");
            }
            if (index === runInfos.length - 1) {
                this.disableBtn("btn-next");
            }
            this.updateRunPage(runInfos[index].guid);
        });
    }
    static tryLoadRunByGuid() {
        const guid = UrlHelper.getParam("runGuid");
        if (guid === "") {
            this.loadRun();
            return;
        }
        let runInfos;
        var loader = new JsonLoader(PageType.TestRunPage);
        loader.loadRunsJson((response) => {
            runInfos = JSON.parse(response, loader.reviveRun);
            this.runsCount = runInfos.length;
            const runInfo = runInfos.find((r) => r.guid === guid);
            if (runInfo != undefined) {
                this.enableBtns();
                const index = runInfos.indexOf(runInfo);
                if (index === 0) {
                    this.disableBtn("btn-prev");
                }
                if (index === runInfos.length - 1) {
                    this.disableBtn("btn-next");
                }
                this.loadRun(index);
            }
            else {
                this.loadRun();
            }
        });
    }
    static enableBtns() {
        document.getElementById("btn-prev").removeAttribute("disabled");
        document.getElementById("btn-next").removeAttribute("disabled");
    }
    static disableBtn(id) {
        document.getElementById(id).setAttribute("disabled", "true");
    }
    static loadPrev() {
        if (this.currentRun === 0) {
            this.disableBtn("btn-prev");
            return;
        }
        else {
            this.enableBtns();
            this.currentRun -= 1;
            if (this.currentRun === 0) {
                this.disableBtn("btn-prev");
            }
            this.loadRun(this.currentRun);
        }
    }
    static loadNext() {
        if (this.currentRun === this.runsCount - 1) {
            this.disableBtn("btn-next");
            return;
        }
        else {
            this.enableBtns();
            this.currentRun += 1;
            if (this.currentRun === this.runsCount - 1) {
                this.disableBtn("btn-next");
            }
            this.loadRun(this.currentRun);
        }
    }
    static loadLatest() {
        this.disableBtn("btn-next");
        this.loadRun();
    }
    static initializePage() {
        this.tryLoadRunByGuid();
        this.showTab("run-main-stats", document.getElementById("tab-run-main-stats"));
    }
    static showTab(idToShow, caller) {
        TabsHelper.showTab(idToShow, caller, this.runPageTabsIds);
    }
}
RunPageUpdater.runPageTabsIds = ["run-main-stats", "run-test-list"];
class JsonLoader {
    constructor(pt) {
        this.pageType = pt;
    }
    loadRunJson(runGuid, callback) {
        const path = PathsHelper.getRunPath(this.pageType, runGuid);
        this.loadJson(path, callback);
    }
    loadRunsJson(callback) {
        const path = PathsHelper.getRunsPath(this.pageType);
        this.loadJson(path, callback);
    }
    loadJson(path, callback) {
        const req = new XMLHttpRequest();
        req.overrideMimeType("application/json");
        req.open("get", path, true);
        req.onreadystatechange = () => {
            if (req.readyState === 4)
                if (req.status !== 200) {
                    console
                        .log(`Error while loading .json data! Request status: ${req.status} : ${req.statusText}`);
                }
                else {
                    callback(req.responseText);
                }
        };
        req.timeout = 2000;
        req.ontimeout = () => {
            console.log(`Timeout while loading .json data! Request status: ${req.status} : ${req.statusText}`);
        };
        req.send(null);
    }
    loadJsons(paths, ind, resps, callback) {
        const count = paths.length;
        if (ind >= count) {
            callback(resps);
            return;
        }
        const req = new XMLHttpRequest();
        req.overrideMimeType("application/json");
        req.open("get", paths[ind], true);
        req.onreadystatechange = () => {
            if (req.readyState === 4)
                if (req.status !== 200) {
                    console
                        .log(`Error while loading .json data! Request status: ${req.status} : ${req.statusText}`);
                }
                else {
                    resps[ind] = req.responseText;
                    ind++;
                    this.loadJsons(paths, ind, resps, callback);
                }
        };
        req.timeout = 2000;
        req.ontimeout = () => {
            console.log(`Timeout while loading .json data! Request status: ${req.status} : ${req.statusText}`);
        };
        req.send(null);
    }
    reviveRun(key, value) {
        if (key === "start" || key === "finish")
            return new Date(value);
        return value;
    }
}
class ReportPageUpdater {
    static updateFields(run) {
        document.getElementById("start").innerHTML = `Start datetime: ${DateFormatter.format(run.runInfo.start)}`;
        document.getElementById("finish").innerHTML = `Finish datetime: ${DateFormatter.format(run.runInfo.finish)}`;
        document.getElementById("duration").innerHTML = `Duration: ${DateFormatter.diff(run.runInfo.start, run.runInfo.finish)}`;
    }
    static updatePlotlyBars(runs) {
        document.getElementById("total").innerHTML = `Total: ${runs.length}`;
        let plotlyData = new Array();
        const passedY = new Array();
        const failedY = new Array();
        const brokenY = new Array();
        const inconclY = new Array();
        const ignoredY = new Array();
        const unknownY = new Array();
        const passedX = new Array();
        const failedX = new Array();
        const brokenX = new Array();
        const inconclX = new Array();
        const ignoredX = new Array();
        const unknownX = new Array();
        const tickvals = new Array();
        const ticktext = new Array();
        for (let i = 0; i < runs.length; i++) {
            const s = runs[i].summary;
            passedY[i] = s.success;
            failedY[i] = s.failures;
            brokenY[i] = s.errors;
            inconclY[i] = s.inconclusive;
            ignoredY[i] = s.ignored;
            unknownY[i] = s.unknown;
            passedX[i] = i;
            failedX[i] = i;
            brokenX[i] = i;
            inconclX[i] = i;
            ignoredX[i] = i;
            unknownX[i] = i;
            tickvals[i] = i;
            ticktext[i] = `run ${i}`;
        }
        const trType = "bar";
        const hi = "y";
        plotlyData = [
            { x: passedX, y: passedY, name: "passed", type: trType, hoverinfo: hi, marker: { color: Color.passed } },
            { x: brokenX, y: brokenY, name: "broken", type: trType, hoverinfo: hi, marker: { color: Color.broken } },
            { x: failedX, y: failedY, name: "failed", type: trType, hoverinfo: hi, marker: { color: Color.failed } },
            { x: inconclX, y: inconclY, name: "inconclusive", type: trType, hoverinfo: hi, marker: { color: Color.inconclusive } },
            { x: ignoredX, y: ignoredY, name: "ignored", type: trType, hoverinfo: hi, marker: { color: Color.ignored } },
            { x: unknownX, y: unknownY, name: "unknown", type: trType, hoverinfo: hi, marker: { color: Color.unknown } }
        ];
        const pieDiv = document.getElementById("runs-bars");
        Plotly.newPlot(pieDiv, plotlyData, {
            barmode: "stack",
            bargap: 0.01,
            xaxis: {
                tickvals: tickvals,
                ticktext: ticktext
            }
        });
    }
    static updatePage(index = undefined) {
        let runInfos;
        const paths = new Array();
        const r = new Array();
        const runs = new Array();
        var loader = new JsonLoader(PageType.TestRunsPage);
        loader.loadRunsJson((response) => {
            runInfos = JSON.parse(response, loader.reviveRun);
            for (let i = 0; i < runInfos.length; i++) {
                paths[i] = `runs/run_${runInfos[i].guid}.json`;
            }
            loader.loadJsons(paths, 0, r, (responses) => {
                for (let i = 0; i < responses.length; i++) {
                    runs[i] = JSON.parse(responses[i], loader.reviveRun);
                }
                this.updateFields(runs[runs.length - 1]);
                this.updatePlotlyBars(runs);
            });
        });
    }
    static showTab(idToShow, caller) {
        TabsHelper.showTab(idToShow, caller, this.reportPageTabsIds);
    }
}
ReportPageUpdater.reportPageTabsIds = ["runs-stats", "runs-list"];
function loadRun1(guid) {
}
//# sourceMappingURL=ghpr.controller.js.map