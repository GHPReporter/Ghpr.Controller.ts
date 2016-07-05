﻿///<reference path="./../interfaces/IItemInfo.ts"/>
///<reference path="./../interfaces/IRun.ts"/>
///<reference path="./../interfaces/ITestRun.ts"/>
///<reference path="./../enums/PageType.ts"/>
///<reference path="./JsonLoader.ts"/>
///<reference path="./UrlHelper.ts"/>
///<reference path="./DateFormatter.ts"/>
///<reference path="./Color.ts"/>
///<reference path="./PlotlyJs.ts"/>
///<reference path="./TabsHelper.ts"/>

class RunPageUpdater {

    static currentRun: number;
    static runsCount: number; 
    static loader = new JsonLoader(PageType.TestRunPage);

    private static updateTime(run: IRun): void {
        document.getElementById("start").innerHTML = `Start datetime: ${DateFormatter.format(run.runInfo.start)}`;
        document.getElementById("finish").innerHTML = `Finish datetime: ${DateFormatter.format(run.runInfo.finish)}`;
        document.getElementById("duration").innerHTML = `Duration: ${DateFormatter.diff(run.runInfo.start, run.runInfo.finish)}`;
    }

    private static updateTitle(run: IRun): void {
        document.getElementById("page-title").innerHTML = run.name;
    }

    private static updateSummary(run: IRun): void {
        const s = run.summary;
        document.getElementById("total").innerHTML = `Total: ${s.total}`;
        document.getElementById("passed").innerHTML = `Success: ${s.success}`;
        document.getElementById("broken").innerHTML = `Errors: ${s.errors}`;
        document.getElementById("failed").innerHTML = `Failures: ${s.failures}`;
        document.getElementById("inconclusive").innerHTML = `Inconclusive: ${s.inconclusive}`;
        document.getElementById("ignored").innerHTML = `Ignored: ${s.ignored}`;
        document.getElementById("unknown").innerHTML = `Unknown: ${s.unknown}`;
        
        const pieDiv = document.getElementById("summary-pie");
        Plotly.newPlot(pieDiv,
        [
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
        ],
        {
            margin: { t: 0 }
        });
    }

    private static setTestsList(tests: Array<ITestRun>): void {
        let list = "";
        const c = tests.length;
        for (let i = 0; i < c; i++) {
            const t = tests[i];
            list += `<li id=$test-${t.testInfo.guid}>Test #${c - i - 1}: <a href="./../tests/?testGuid=${t.testInfo.guid}&testFile=${t.testInfo.fileName}">${t.name}</a></li>`;
        }
        document.getElementById("all-tests").innerHTML = list;
    }
    
    private static updateRunPage(runGuid: string): IRun {
        let run: IRun;
        this.loader.loadRunJson(runGuid, (response: string) => {
            run = JSON.parse(response, JsonLoader.reviveRun);
            UrlHelper.insertParam("runGuid", run.runInfo.guid);
            this.updateTime(run);
            this.updateSummary(run);
            RunPageUpdater.updateTitle(run);
            this.updateTestsList(run);
        });
        return run;
    }

    static updateTestsList(run: IRun): void {
        const paths: Array<string> = new Array();
        const testStrings: Array<string> = new Array();
        const tests: Array<ITestRun> = new Array();

        document.getElementById("btn-back").setAttribute("href", `./../`);

        const files = run.testRunFiles;
        for (let i = 0; i < files.length; i++) {
            paths[i] = `./../tests/${files[i]}`;
        }
        this.loader.loadJsons(paths, 0, testStrings, (responses: Array<string>) => {
            for (let i = 0; i < responses.length; i++) {
                tests[i] = JSON.parse(responses[i], JsonLoader.reviveRun);
            }
            this.setTestsList(tests);
        });
    }

    private static loadRun(index: number = undefined): void {
        let runInfos: Array<IItemInfo>;
        this.loader.loadRunsJson((response: string) => {
            runInfos = JSON.parse(response, JsonLoader.reviveRun);
            runInfos.sort(Sorter.itemInfoSorterByFinishDateFunc);
            this.runsCount = runInfos.length;
            if (index === undefined || index.toString() === "NaN") {
                index = this.runsCount - 1;
            }
            if (index === 0) {
                this.disableBtn("btn-prev");
            }
            if (index === runInfos.length - 1) {
                this.disableBtn("btn-next");
            }
            this.currentRun = index;
            this.updateRunPage(runInfos[index].guid);
        });
    }

    private static tryLoadRunByGuid(): void {
        const guid = UrlHelper.getParam("runGuid");
        if (guid === "") {
            this.loadRun();
            return;
        }
        let runInfos: Array<IItemInfo>;
        this.loader.loadRunsJson((response: string) => {
            runInfos = JSON.parse(response, JsonLoader.reviveRun);
            runInfos.sort(Sorter.itemInfoSorterByFinishDateFunc);
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
            } else {
                this.loadRun();
            }
        });
    }

    private static enableBtns(): void {
        document.getElementById("btn-prev").removeAttribute("disabled");
        document.getElementById("btn-next").removeAttribute("disabled");
    }

    private static disableBtn(id: string): void {
        document.getElementById(id).setAttribute("disabled", "true");
    }

    static loadPrev(): void {
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

    static loadNext(): void {
        if (this.currentRun === this.runsCount - 1) {
            this.disableBtn("btn-next");
            return;
        } else {
            this.enableBtns();
            this.currentRun += 1;
            if (this.currentRun === this.runsCount - 1) {
                this.disableBtn("btn-next");
            }
            this.loadRun(this.currentRun);
        }
    }

    static loadLatest(): void {
        this.disableBtn("btn-next");
        this.loadRun();
    }

    static initializePage(): void {
        const tab = UrlHelper.getParam("currentTab");
        this.tryLoadRunByGuid();
        this.showTab(tab === "" ? "run-main-stats" : tab, document.getElementById(`tab-${tab}`));
    }

    private static runPageTabsIds: Array<string> = ["run-main-stats", "run-test-list"];

    static showTab(idToShow: string, caller: HTMLElement): void {
        TabsHelper.showTab(idToShow, caller, this.runPageTabsIds);
    }
}