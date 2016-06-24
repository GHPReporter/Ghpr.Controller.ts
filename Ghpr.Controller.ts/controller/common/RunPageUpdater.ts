///<reference path="./../interfaces/IRun.ts"/>
///<reference path="./../enums/PageType.ts"/>
///<reference path="./JsonLoader.ts"/>
///<reference path="./DateFormatter.ts"/>
///<reference path="./Color.ts"/>

declare var Plotly: any;

class RunPageUpdater {
    static updateTime(run: IRun): void {
        document.getElementById("start").innerHTML += DateFormatter.format(run.start);
        document.getElementById("finish").innerHTML += DateFormatter.format(run.finish);
        document.getElementById("duration").innerHTML += DateFormatter.diff(run.start, run.finish);
    }

    static updateSummary(run: IRun): void {
        const s = run.summary;
        document.getElementById("total").innerHTML += s.total;
        document.getElementById("passed").innerHTML += s.success;
        document.getElementById("broken").innerHTML += s.errors;
        document.getElementById("failed").innerHTML += s.failures;
        document.getElementById("inconclusive").innerHTML += s.inconclusive;
        document.getElementById("ignored").innerHTML += s.ignored;
        document.getElementById("unknown").innerHTML += s.unknown;

        const pieDiv = document.getElementById("summary-pie");
        Plotly.plot(pieDiv,
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
        loader.loadJson(runGuid, PageType.TestRunPage, (response: string) => {
            run = JSON.parse(response, loader.reviveRun);
            RunPageUpdater.updateTime(run);
            RunPageUpdater.updateSummary(run);
        });
        return run;
    }
}