///<reference path="./../interfaces/IRun.ts"/>
///<reference path="./../enums/PageType.ts"/>
///<reference path="./RunPageUpdater.ts"/>

class JsonLoader {
    getRunPath(pt: PageType, guid: string): string {
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

    loadRunJson(runGuid: string, pt: PageType, callback: Function): void {
        const path = this.getRunPath(pt, runGuid);
        this.loadJson(path, callback);
    }

    loadRunsJson(callback: Function): void {
        const path = "./runs.json";
        this.loadJson(path, callback);
    }

    loadJson(path: string, callback: Function): void {
        const req = new XMLHttpRequest();
        req.overrideMimeType("application/json");
        req.open("get", path, true);
        req.onreadystatechange = () => {
            if (req.readyState === 4)
                if (req.status !== 200) {
                    console
                        .log(`Error while loading .json data! Request status: ${req.status} : ${req.statusText}`);
                } else {
                    callback(req.responseText);
                }
        }
        req.timeout = 2000;
        req.ontimeout = () => {
            console.log(`Timeout while loading .json data! Request status: ${req.status} : ${req.statusText}`);
        };
        req.send(null);
    }

    reviveRun(key: any, value: any): any {
        if (key === "start" || key === "finish") return new Date(value);
        return value;
    }
}