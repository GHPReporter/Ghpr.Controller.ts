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
///<reference path="./TestRunHelper.ts"/>

class TestPageUpdater {

    static currentTest: number;
    static testVersionsCount: number;
    static loader = new JsonLoader(PageType.TestPage);

    private static updateMainInformation(test: ITestRun): void {
        console.log(test);
        document.getElementById("page-title").innerHTML = `<b>Test:</b> ${test.name}`;
        document.getElementById("name").innerHTML = `<b>Test name:</b> ${test.name}`;
        document.getElementById("full-name").innerHTML = `<b>Full name:</b> ${test.fullName}`;
        document.getElementById("result").innerHTML = `<b>Result:</b> ${TestRunHelper.getColoredResult(test)}`;
        document.getElementById("start").innerHTML = `<b>Start datetime:</b> ${DateFormatter.format(test.testInfo.start)}`;
        document.getElementById("finish").innerHTML = `<b>Finish datetime:</b> ${DateFormatter.format(test.testInfo.finish)}`;
        document.getElementById("duration").innerHTML = `<b>Duration:</b> ${test.duration.toString()}`;
        document.getElementById("message").innerHTML = `<b>Message:</b> ${TestRunHelper.getMessage(test)}`;
    }

    private static updateOutput(test: ITestRun): void {
        document.getElementById("test-output-string").innerHTML = `${test.output}`;
    }

    private static setTestHistory(tests: Array<ITestRun>): void {
        const pieDiv = document.getElementById("test-history-chart");
        Plotly.newPlot(pieDiv,
            [
                {
                    values: [1,2,3,4,5,6],
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

    private static updateTestPage(testGuid: string, fileName: string): ITestRun {
        let test: ITestRun;
        this.loader.loadTestJson(testGuid, fileName, (response: string) => {
            test = JSON.parse(response, JsonLoader.reviveRun);
            UrlHelper.insertParam("testGuid", test.testInfo.guid);
            UrlHelper.insertParam("testFile", test.testInfo.fileName);
            this.updateMainInformation(test);
            document.getElementById("btn-back").setAttribute("href", `./../runs/?runGuid=${test.runGuid}`);
            this.updateTestHistory();
        });
        return test;
    }

    static updateTestHistory(): void {
        const paths: Array<string> = new Array();
        const testStrings: Array<string> = new Array();
        const tests: Array<ITestRun> = new Array();

        const guid = UrlHelper.getParam("testGuid");
        let testInfos: Array<IItemInfo>;
        this.loader.loadTestsJson(guid, (response: string) => {
            testInfos = JSON.parse(response, JsonLoader.reviveRun);
            testInfos.sort(Sorter.itemInfoSorterByFinishDateFunc);

            for (let i = 0; i < testInfos.length; i++) {
                paths[i] = `./${testInfos[i].guid}/${testInfos[i].fileName}`;
            }

            this.loader.loadJsons(paths, 0, testStrings, (responses: Array<string>) => {
                for (let i = 0; i < responses.length; i++) {
                    tests[i] = JSON.parse(responses[i], JsonLoader.reviveRun);
                }
                this.setTestHistory(tests);
            });
        });
        
    }

    private static loadTest(index: number = undefined): void {
        const guid = UrlHelper.getParam("testGuid");
        let testInfos: Array<IItemInfo>;
        this.loader.loadTestsJson(guid, (response: string) => {
            testInfos = JSON.parse(response, JsonLoader.reviveRun);
            testInfos.sort(Sorter.itemInfoSorterByFinishDateFunc);
            this.testVersionsCount = testInfos.length;
            if (index === undefined || index.toString() === "NaN") {
                index = this.testVersionsCount - 1;
            }
            if (index === 0) {
                this.disableBtn("btn-prev");
            }
            if (index === testInfos.length - 1) {
                this.disableBtn("btn-next");
            }
            this.currentTest = index;
            this.updateTestPage(testInfos[index].guid, testInfos[index].fileName);
        });
    }

    private static tryLoadTestByGuid(): void {
        const guid = UrlHelper.getParam("testGuid");
        const fileName = UrlHelper.getParam("testFile");
        let testInfos: Array<IItemInfo>;
        this.loader.loadTestsJson(guid, (response: string) => {
            testInfos = JSON.parse(response, JsonLoader.reviveRun);
            testInfos.sort(Sorter.itemInfoSorterByFinishDateFunc);
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
        const tab = UrlHelper.getParam("currentTab");
        this.tryLoadTestByGuid();
        this.showTab(tab === "" ? "test-history" : tab, document.getElementById(`tab-${tab}`));
    }

    private static runPageTabsIds: Array<string> = ["test-history", "test-output"];

    static showTab(idToShow: string, caller: HTMLElement): void {
        TabsHelper.showTab(idToShow, caller, this.runPageTabsIds);
    }
}