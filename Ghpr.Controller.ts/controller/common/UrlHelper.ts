class UrlHelper {
    static insertParam(key: string, value: string): void {
        const paramsPart = document.location.search.substr(1);
        if (paramsPart === "") {
            window.history.pushState("", "", `?${key}=${value}`);
        }
        else {
            const params = paramsPart.split("&");
            console.log("paramsC: " + params.length);
            for (let p of params) {
                console.log(`p: ${p}`);
                const kv = p.split("=");
                const k = kv[0];
                let v = kv[1];
                console.log(`k: ${k}, v: ${v}`);
                if (k === key) {
                    v = value;
                }

            }
        }
    }
}