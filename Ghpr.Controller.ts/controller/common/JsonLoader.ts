///<reference path="./../interfaces/IRun.ts"/>
///<reference path="./../enums/PageType.ts"/>

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

    loadJson(runGuid: string, pt: PageType, callback: Function): void {
        
        const path = this.getRunPath(pt, runGuid);
        console.log(path);

        const req = new XMLHttpRequest();
        req.overrideMimeType("application/json");
        req.open("get", path, true);
        req.onreadystatechange = () => {
            if (req.readyState === 4)
                if (req.status !== 200) {
                    console
                        .log(`Error while loading IRun .json data! Request status: ${req.status} : ${req.statusText}`);
                } else {
                    callback(req.responseText);
                }
        }
        req.timeout = 2000;
        req.ontimeout = () => {
            console.log(`Timeout while loading IRun .json data! Request status: ${req.status} : ${req.statusText}`);
        };
        req.send(null);

    }

    getRun(runGuid: string, pt: PageType): IRun {
        let run: IRun;
        this.loadJson(runGuid, pt, (response: string) => {
            console.log("r: " + response);
            run = JSON.parse(response);
        });
        return run;
    }

    loadRun(runGuid: string, pt: PageType): IRun {
        let run: IRun;

        const path = this.getRunPath(pt, runGuid);
        console.log(path);

        const req = new XMLHttpRequest();
        req.open("get", path, true);
        req.send();
        req.onreadystatechange = () => {
            if (req.readyState !== 4) return null;
            if (req.status !== 200) {
                console.log(`Error while loading IRun .json data! Request status: ${req.status} : ${req.statusText}`);
                return null;
            } else {
                run = JSON.parse(req.responseText);
                return run;
            }
        }
        req.timeout = 2000;
        return null;
    }
}