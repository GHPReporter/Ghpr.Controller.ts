class DateFormatter {
    static format(date: Date): string {
        if (date < new Date(2000, 1)) {
            return "-";
        }
        const year = `${date.getFullYear()}`;
        const month = this.correct(`${date.getMonth() + 1}`);
        const day = this.correct(`${date.getDate()}`);
        const hour = this.correct(`${date.getHours()}`);
        const minute = this.correct(`${date.getMinutes()}`);
        const second = this.correct(`${date.getSeconds()}`);
        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    }

    static diff(start: Date, finish: Date): string {
        const timeDifference = (finish.getTime() - start.getTime());
        const dDate = new Date(timeDifference);
        const dHours = dDate.getUTCHours();
        const dMins = dDate.getUTCMinutes();
        const dSecs = dDate.getUTCSeconds();
        const dMilliSecs = dDate.getUTCMilliseconds();
        const readableDifference = dHours + ":" + dMins + ":" + dSecs + "." + dMilliSecs;
        return readableDifference;
    }

    static correct(s: string): string {
        if (s.length === 1) {
            return `0${s}`;
        } else return s;
    }
}