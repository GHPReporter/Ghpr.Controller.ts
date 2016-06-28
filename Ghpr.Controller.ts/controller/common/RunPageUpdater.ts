///<reference path="./../interfaces/IRunInfo.ts"/>
///<reference path="./../interfaces/IRun.ts"/>
///<reference path="./../enums/PageType.ts"/>
///<reference path="./JsonLoader.ts"/>
///<reference path="./UrlHelper.ts"/>
///<reference path="./DateFormatter.ts"/>
///<reference path="./Color.ts"/>

declare var Plotly: any;

class RunPageUpdater {

    static currentRun: number;
    static runsCount: number; 

    static updateTime(run: IRun): void {
        document.getElementById("start").innerHTML = `Start datetime: ${DateFormatter.format(run.runInfo.start)}`;
        document.getElementById("finish").innerHTML = `Finish datetime: ${DateFormatter.format(run.runInfo.finish)}`;
        document.getElementById("duration").innerHTML = `Duration: ${DateFormatter.diff(run.runInfo.start, run.runInfo.finish)}`;
    }

    static updateName(run: IRun): void {
        document.getElementById("run-name").innerHTML = run.name;
    }

    static updateSummary(run: IRun): void {
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
    
    static updateRunPage(runGuid: string): IRun {
        let run: IRun;
        var loader = new JsonLoader();
        loader.loadRunJson(runGuid, PageType.TestRunPage, (response: string) => {
            run = JSON.parse(response, loader.reviveRun);
            UrlHelper.insertParam("runGuid", run.runInfo.guid);
            RunPageUpdater.updateTime(run);
            RunPageUpdater.updateSummary(run);
            RunPageUpdater.updateName(run);
        });
        return run;
    }

    static loadRun(index: number = undefined): void {
        let runInfos: Array<IRunInfo>;
        var loader = new JsonLoader();
        loader.loadRunsJson((response: string) => {
            runInfos = JSON.parse(response, loader.reviveRun);
            this.runsCount = runInfos.length;
            if (index === undefined || index.toString() === "NaN") {
                index = this.runsCount - 1;
                this.currentRun = index;
            }
            this.updateRunPage(runInfos[index].guid);
        });
    }

    static tryLoadRunByGuid(): void {
        const guid = UrlHelper.getParam("runGuid");
        if (guid === "") {
            this.loadRun();
            return;
        }
        let runInfos: Array<IRunInfo>;
        var loader = new JsonLoader();
        loader.loadRunsJson((response: string) => {
            runInfos = JSON.parse(response, loader.reviveRun);
            this.runsCount = runInfos.length;
            const runInfo = runInfos.find((r) => r.guid === guid);
            if (runInfo != undefined) {
                this.loadRun(runInfos.indexOf(runInfo));
            } else {
                this.loadRun();
            }
        });
    }
    
    static loadPrev(): void {
        if (this.currentRun === 0) {
            return;
        }
        else {
            this.currentRun -= 1;
            this.loadRun(this.currentRun);
        }
    }

    static loadNext(): void {
        if (this.currentRun === this.runsCount - 1) {
            return;
        } else {
            this.currentRun += 1;
            this.loadRun(this.currentRun);
        }
    }

    static loadLatest(): void {
        this.loadRun();
    }

    static initialize(): void {
        this.tryLoadRunByGuid();
    }
}