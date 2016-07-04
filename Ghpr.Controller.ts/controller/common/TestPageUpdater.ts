///<reference path="./../interfaces/IItemInfo.ts"/>
///<reference path="./../interfaces/IRun.ts"/>
///<reference path="./../interfaces/ITestRun.ts"/>
///<reference path="./../enums/PageType.ts"/>
///<reference path="./JsonLoader.ts"/>
///<reference path="./UrlHelper.ts"/>
///<reference path="./DateFormatter.ts"/>
///<reference path="./Color.ts"/>
///<reference path="./PlotlyJs.ts"/>
///<reference path="./TabsHelper.ts"/>

class TestPageUpdater {

    static currentTest: number;
    static testVersionsCount: number;

    private static updateMainInformation(test: ITestRun): void {
        document.getElementById("start").innerHTML = `Start datetime: ${DateFormatter.format(test.testInfo.start)}`;
        document.getElementById("finish").innerHTML = `Finish datetime: ${DateFormatter.format(test.testInfo.finish)}`;
        document.getElementById("duration").innerHTML = `Duration: ${test.testDuration}`;
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

    private static updateTestPage(testGuid: string, fileName: string): ITestRun {
        let test: ITestRun;
        var loader = new JsonLoader(PageType.TestPage);
        loader.loadTestJson(testGuid, fileName, (response: string) => {
            test = JSON.parse(response, loader.reviveRun);
            UrlHelper.insertParam("testGuid", test.testInfo.guid);
            UrlHelper.insertParam("testFile", test.testInfo.fileName);
            this.updateMainInformation(test);
            //this.updateSummary(test);
            //this.updateTestsList(test);
        });
        return test;
    }

    static updateTestsList(run: IRun): void {
        const paths: Array<string> = new Array();
        const testStrings: Array<string> = new Array();
        const tests: Array<ITestRun> = new Array();
        var loader = new JsonLoader(PageType.TestPage);

        const files = run.testRunFiles;
        for (let i = 0; i < files.length; i++) {
            paths[i] = `./../tests/${files[i]}`;
        }
        loader.loadJsons(paths, 0, testStrings, (responses: Array<string>) => {
            for (let i = 0; i < responses.length; i++) {
                tests[i] = JSON.parse(responses[i], loader.reviveRun);
            }
            this.setTestsList(tests);
        });
    }

    private static sorter(a: IItemInfo, b: IItemInfo): number {
        if (a.finish > b.finish) {
            return 1;
        }
        if (a.finish < b.finish) {
            return -1;
        }
        return 0;
    }

    private static loadTest(index: number = undefined): void {
        const guid = UrlHelper.getParam("testGuid");
        let testInfos: Array<IItemInfo>;
        var loader = new JsonLoader(PageType.TestPage);
        loader.loadTestsJson(guid, (response: string) => {
            testInfos = JSON.parse(response, loader.reviveRun);
            testInfos.sort(this.sorter);
            this.testVersionsCount = testInfos.length;
            if (index === undefined || index.toString() === "NaN") {
                index = this.testVersionsCount - 1;
                this.currentTest = index;
            }
            if (index === 0) {
                this.disableBtn("btn-prev");
            }
            if (index === testInfos.length - 1) {
                this.disableBtn("btn-next");
            }
            TestPageUpdater.updateTestPage(testInfos[index].guid, testInfos[index].fileName);
        });
    }

    private static tryLoadTestByGuid(): void {
        const guid = UrlHelper.getParam("testGuid");
        const fileName = UrlHelper.getParam("testFile");
        let testInfos: Array<IItemInfo>;
        var loader = new JsonLoader(PageType.TestPage);
        loader.loadTestsJson(guid, (response: string) => {
            testInfos = JSON.parse(response, loader.reviveRun);
            testInfos.sort(this.sorter);
            this.testVersionsCount = testInfos.length;
            const testInfo = testInfos.find((t) => t.fileName === fileName);
            if (testInfo != undefined) {
                this.enableBtns();
                const index = testInfos.indexOf(testInfo);
                if (index === 0) {
                    this.disableBtn("btn-prev");
                }
                if (index === testInfos.length - 1) {
                    this.disableBtn("btn-next");
                }
                this.loadTest(index);
            } else {
                this.loadTest();
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
        if (this.currentTest === 0) {
            this.disableBtn("btn-prev");
            return;
        }
        else {
            this.enableBtns();
            this.currentTest -= 1;
            if (this.currentTest === 0) {
                this.disableBtn("btn-prev");
            }
            this.loadTest(this.currentTest);
        }
    }

    static loadNext(): void {
        if (this.currentTest === this.testVersionsCount - 1) {
            this.disableBtn("btn-next");
            return;
        } else {
            this.enableBtns();
            this.currentTest += 1;
            if (this.currentTest === this.testVersionsCount - 1) {
                this.disableBtn("btn-next");
            }
            this.loadTest(this.currentTest);
        }
    }

    static loadLatest(): void {
        this.disableBtn("btn-next");
        this.loadTest();
    }

    static initializePage(): void {
        this.tryLoadTestByGuid();
        this.showTab("test-history", document.getElementById("tab-test-history"));
    }

    private static runPageTabsIds: Array<string> = ["test-history", "test-output"];

    static showTab(idToShow: string, caller: HTMLElement): void {
        TabsHelper.showTab(idToShow, caller, this.runPageTabsIds);
    }
}