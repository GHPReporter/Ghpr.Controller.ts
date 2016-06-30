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
        
        let plotlyData = new Array();
        const passedY: Array<number> = new Array();
        const failedY: Array<number> = new Array();
        const brokenY: Array<number> = new Array();
        const inconclY: Array<number> = new Array();
        const ignoredY: Array<number> = new Array();
        const unknownY: Array<number> = new Array();

        const passedX: Array<number> = new Array();
        const failedX: Array<number> = new Array();
        const brokenX: Array<number> = new Array();
        const inconclX: Array<number> = new Array();
        const ignoredX: Array<number> = new Array();
        const unknownX: Array<number> = new Array();

        const tickvals: Array<number> = new Array();
        const ticktext: Array<string> = new Array();

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
            ticktext[i] = `run ${i}`;//runs[i].name;
        }
        const t = "bar";
        const hi = "y";
        plotlyData = [
            { x: passedX, y: passedY,   name: "passed",       type: t, hoverinfo: hi, marker: { color: Color.passed } },
            { x: brokenX,  y: brokenY,  name: "broken",       type: t, hoverinfo: hi, marker: { color: Color.broken } },
            { x: failedX,  y: failedY,  name: "failed",       type: t, hoverinfo: hi, marker: { color: Color.failed } },
            { x: inconclX, y: inconclY, name: "inconclusive", type: t, hoverinfo: hi, marker: { color: Color.inconclusive } },
            { x: ignoredX, y: ignoredY, name: "ignored",      type: t, hoverinfo: hi, marker: { color: Color.ignored } },
            { x: unknownX, y: unknownY, name: "unknown",      type: t, hoverinfo: hi, marker: { color: Color.unknown } }
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