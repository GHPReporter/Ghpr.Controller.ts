///<reference path="JsonLoader.ts"/>

function loadRun(guid: string) {
    RunPageUpdater.updateRunPage(guid);
}

function loadFirstRun() {
    RunPageUpdater.loadFirst();
}

