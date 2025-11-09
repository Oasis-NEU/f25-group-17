import { assert } from "console";
import Cache from "./cache.js";

const buildingsMap = getBuildingsMap();

class RoomSchedule {
    constructor(buildingCode, roomNumber) {
        this.building = buildingsMap[buildingCode] || "Unknown Building Code";
        this.buildingCode = buildingCode;
        this.roomNumber = roomNumber;
        this.timeBoundaries = {
            monday:    new TimeBoundaries(),
            tuesday:   new TimeBoundaries(),
            wednesday: new TimeBoundaries(),
            thursday:  new TimeBoundaries(),
            friday:    new TimeBoundaries(),
            saturday:  new TimeBoundaries(),
            sunday:    new TimeBoundaries()
        };
    }
}

class TimeBoundaries {
    constructor() {
        this.boundaries = [new TimeHHMM(0, 0), new TimeHHMM(23, 59)];
    }

    push(timeBoundary) {
        for(let i = 0; i < this.boundaries.length; i++) {
            if(this.boundaries[i].compare(timeBoundary) == 0) {
                console.log("Warning: Attempted to add duplicate TimeHHMM");
                return;
            } else if(this.boundaries[i].compare(timeBoundary) > 0) {
                this.boundaries.splice(i, 0, timeBoundary);
                return;
            }
        }
        assert(false, "TimeBoundaries.push did not insert TimeHHMM");
    }

    checkFree(timeHHMM) {
        if(!(timeHHMM instanceof TimeHHMM)) {
            throw new Error("Can only check if a TimeHHMM is free in TimeBoundaries");
        }
        if(this.boundaries.length % 2 != 0) {
            throw new Error("TimeBoundaries boundaries length is not even");
        }
        for(let i = 0; i < this.boundaries.length - 1; i += 2) {
            const beforeLeft = this.boundaries[i].compare(timeHHMM) > 0;
            const beforeRight = this.boundaries[i + 1].compare(timeHHMM) > 0;
            if(!beforeLeft && beforeRight) {
                return true;
            }
            if(!beforeLeft && !beforeRight) {
                return false;
            }
        }
        assert(false, "TimeBoundaries.checkFree should not reach here");
    }
}

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

function getBuildingsMap() {
    const termsCache = new Cache("currentTerms.json");
    const terms = termsCache.read();
    const buildings = {};

    terms.forEach(term => {
        const cmtCache = new Cache(`${term.code}/courseMeetingTimes.json`);
        cmtCache.read().forEach(course => {
            course.meetingTimes.forEach(meetingTime => {
                if(meetingTime.building && meetingTime.buildingCode) {
                    buildings[meetingTime.buildingCode] = meetingTime.building;
                }
            });
        });
    });

    const orderedBuildings = {};
    Object.keys(buildings).sort().forEach(key => {
        orderedBuildings[key] = buildings[key];
    });

    return orderedBuildings;
}

let testrs = new RoomSchedule("TEST", "101");
console.log(testrs.timeBoundaries);
testrs.timeBoundaries.monday.push(new TimeHHMM(9, 30));
console.log(testrs.timeBoundaries);

let tbs = new TimeBoundaries();
tbs.push(new TimeHHMM(9, 30));
tbs.push(new TimeHHMM(8, 0));
tbs.push(new TimeHHMM(12, 15));
tbs.push(new TimeHHMM(18, 30));
console.log(tbs);
console.log(tbs.checkFree(new TimeHHMM(8, 45)));