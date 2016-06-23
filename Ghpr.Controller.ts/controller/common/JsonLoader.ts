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

    loadRun(runGuid: string, pt: PageType): IRun {
        let run: IRun;

        const path = this.getRunPath(pt, runGuid);

        const req = new XMLHttpRequest();
        req.open("get", path, true);
        req.send();
        req.onreadystatechange = () => {
            if (req.readyState !== 4) return null;
            if (req.status !== 200) {
                console.log(`Error while loading IRun .json data! Request status: ${req.status} : ${req.statusText}`);
            } else {
                run = JSON.parse(req.responseText);
                return run;
            }
            return null;
        }
        return null;
    }
}