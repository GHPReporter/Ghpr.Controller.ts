///<reference path="JsonLoader.ts"/>

function logRun(guid: string, type: PageType) {
    const jl = new JsonLoader();
    console.log(jl.getRun(guid,  type));
}