///<reference path="./../interfaces/IItemInfo.ts"/>
///<reference path="./../interfaces/IRun.ts"/>
///<reference path="./../enums/PageType.ts"/>
///<reference path="./JsonLoader.ts"/>
///<reference path="./UrlHelper.ts"/>
///<reference path="./DateFormatter.ts"/>
///<reference path="./Color.ts"/>
///<reference path="./PlotlyJs.ts"/>

class ReportPageUpdater {
    private static updateFields(run: IRun): void {
        document.getElementById("start").innerHTML = `Start datetime: ${DateFormatter.format(run.runInfo.start)}`;
        document.getElementById("finish").innerHTML = `Finish datetime: ${DateFormatter.format(run.runInfo.finish)}`;
        document.getElementById("duration").innerHTML = `Duration: ${DateFormatter.diff(run.runInfo.start, run.runInfo.finish)}`;
    }

    private static updatePlotlyBars(runs: Array<IRun>): void {

        document.getElementById("total").innerHTML = `Total: ${runs.length}`;

        const s = runs[0].summary;
        
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
    
    static updatePage(index: number = undefined): void {
        let runInfos: Array<IItemInfo>;
        const paths: Array<string> = new Array();
        const r: Array<string> = new Array();
        const runs: Array<IRun> = new Array();
        var loader = new JsonLoader(PageType.TestRunsPage);
        loader.loadRunsJson((response: string) => {
            runInfos = JSON.parse(response, loader.reviveRun);
            for (let i = 0; i < runInfos.length; i++) {
                paths[i] = `runs/run_${runInfos[i].guid}.json`;
            }
            loader.loadJsons(paths, 0, r, (responses: Array<string>) => {
                console.log(responses);
                for (let i = 0; i < responses.length; i++) {
                    runs[i] = JSON.parse(responses[i], loader.reviveRun);
                }
                this.updateFields(runs[runs.length - 1]);
                this.updatePlotlyBars(runs);
            });
        });
    }

    private static reportPageTabsIds: Array<string> = ["runs-stats", "runs-list"];

    static showTab(idToShow: string, caller: HTMLElement): void {
        TabsHelper.showTab(idToShow, caller, this.reportPageTabsIds);
    }
}