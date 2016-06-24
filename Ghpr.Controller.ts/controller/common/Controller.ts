///<reference path="JsonLoader.ts"/>
///<reference path="FilesGetter.ts"/>

function loadRun(guid: string) {
    RunPageUpdater.updateRunPage(guid);
}

function loadFirstRun(guid: string) {
    const runs = FilesGetter.getRuns();
    RunPageUpdater.updateRunPage(runs[1]);
}