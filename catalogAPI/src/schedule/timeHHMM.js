class TimeHHMM {
    constructor(hour, minute) {
        this.hour = hour > 23 ? 23 : (hour < 0 ? 0 : hour);
        this.minute = minute > 59 ? 59 : (minute < 0 ? 0 : minute);
    }

    compare(other) {
        if(!(other instanceof TimeHHMM)) {
            throw new Error("Can only compare TimeHHMM with another TimeHHMM");
        }
        return ((this.hour - other.hour) * 60) + (this.minute - other.minute);
    }

    getTimeString(is24Hour = true) {
        let hour = this.hour;
        let minute = String(this.minute).padStart(2, '0');
        let period = "";
        if (!is24Hour) {
            period = hour >= 12 ? "PM" : "AM";
            hour = hour % 12 || 12;
        }
        return `${hour}:${minute}${period}`;
    }
}

export default TimeHHMM;