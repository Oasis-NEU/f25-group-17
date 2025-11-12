import Cache from "../cache.js";
import RoomSchedule from "./roomSchedule.js";
import TimeHHMM from "./timeHHMM.js";
import { buildingsMap } from "../constants.js";

class TermSchedule {
    constructor(termCode) {
        this.termCode = termCode;
        this.roomSchedules = {};
        this.cacheCourseMeetingTimes = new Cache(`${termCode}/courseMeetingTimes.json`);
        this.cacheSchedule = new Cache(`${termCode}/roomSchedules.json`);
        this.startDate = {year: null, month: null, day: null};
        this.endDate = {year: null, month: null, day: null};

        this.clearRoomSchedules();
    }

    loadRoomSchedules() {
        console.log(`Converting course times to room schedules for term ${this.termCode}...`)
        if(this.cacheCourseMeetingTimes.isEmpty()) {
            throw new Error(
                "Cannot read room schedules because course meeting times cache is empty."
            );
        }
        const courseMeetingTimes = this.cacheCourseMeetingTimes.read();
        courseMeetingTimes.forEach(course => {
            course.meetingTimes.forEach(meetingTime => this.#updateRoomScheduleWithMeetingTime(course, meetingTime));
        });
    }

    updateCache() {
        this.cacheSchedule.update(this.roomSchedules);
    }

    updateFromCache() {
        if(this.cacheSchedule.isEmpty()) {
            throw new Error("Cannot update TermSchedule from cache because cache is empty.");
        }
        this.roomSchedules = this.cacheSchedule.read();
    }

    clearRoomSchedules() {
        this.roomSchedules = {};
        Object.keys(buildingsMap).forEach((buildingCode) => {
            this.roomSchedules[buildingCode] = {};
        });
    }

    #updateRoomScheduleWithMeetingTime(course, meetingTime) {
        if(!meetingTime.buildingCode || !meetingTime.room) {
            console.log(`${course.CRN} has missing meeting time building or room number.`);
            return;
        }
        if(!(meetingTime.buildingCode in this.roomSchedules)) {
            this.roomSchedules[meetingTime.buildingCode] = {};
            console.log(`Warning: Found building code ${meetingTime.buildingCode} not in buildingsMap.`);
        }
        if(!(meetingTime.room in this.roomSchedules[meetingTime.buildingCode])) {
            this.roomSchedules[meetingTime.buildingCode][meetingTime.room] =
                new RoomSchedule(meetingTime.buildingCode, meetingTime.room);
        }
        const roomSchedule = this.roomSchedules[meetingTime.buildingCode][meetingTime.room];
        const beginTime = new TimeHHMM(
            Number(meetingTime.beginTime.hour),
            Number(meetingTime.beginTime.minute)
        );
        const endTime = new TimeHHMM(
            Number(meetingTime.endTime.hour),
            Number(meetingTime.endTime.minute)
        );
        Object.keys(meetingTime.days).forEach(day => {
            if(meetingTime.days[day]) {
                roomSchedule.timeBoundaries[day].push(beginTime, endTime);
            }
        });
    }
}

function generateInstances(terms) {
    if(!Array.isArray(terms)) {
        throw new Error("Could not generate terms from terms because it is not an array.");
    }
    const instances = [];
    terms.forEach(term => instances.push(new TermSchedule(term)));
    return instances;
}

// const ts = new TermSchedule("202610");
// console.log(ts.roomSchedules);

export default generateInstances;