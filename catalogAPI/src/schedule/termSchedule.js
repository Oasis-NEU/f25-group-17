import Cache from "../cache.js";
import RoomSchedule from "./roomSchedule.js";
import TimeHHMM from "./timeHHMM.js";
import { getBuildingsMap, getMeetingTypesMap } from "../constants.js";

class TermSchedule {
    constructor(termCode) {
        this.termCode = termCode;
        this.roomSchedules = {};
        this.cacheCourseMeetingTimes = new Cache(`${termCode}/courseMeetingTimes.json`);
        this.cacheSchedule = new Cache(`${termCode}/roomSchedules.json`);

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
        console.log(`Updating room schedule cache for term ${this.termCode}...`)
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
        Object.keys(getMeetingTypesMap()).forEach(meetingTypeCode => {
            this.roomSchedules[meetingTypeCode] = {};
            this.roomSchedules[meetingTypeCode]["startDate"] = {year: null, month: null, day: null};
            this.roomSchedules[meetingTypeCode]["endDate"] = {year: null, month: null, day: null};
                this.roomSchedules[meetingTypeCode]["roomSchedules"] = {};
            Object.keys(getBuildingsMap()).forEach(buildingCode => {
                this.roomSchedules[meetingTypeCode]["roomSchedules"][buildingCode] = {};
            });
        });
    }

    #updateRoomScheduleWithMeetingTime(course, meetingTime) {
        if(!meetingTime.buildingCode || !meetingTime.room || !meetingTime.meetingTypeCode) {
            console.log(`${course.CRN} has missing meeting time building, room number, or meeting type code.`);
            return;
        }
        if(!(meetingTime.meetingTypeCode in this.roomSchedules)) {
            this.roomSchedules[meetingTime.meetingTypeCode] = {};
        }
        if(!(meetingTime.buildingCode in this.roomSchedules[meetingTime.meetingTypeCode]["roomSchedules"])) {
            this.roomSchedules[meetingTime.meetingTypeCode]["roomSchedules"][meetingTime.buildingCode] = {};
        }
        if(!(meetingTime.room in this.roomSchedules[meetingTime.meetingTypeCode]["roomSchedules"][meetingTime.buildingCode])) {
            this.roomSchedules[meetingTime.meetingTypeCode]["roomSchedules"][meetingTime.buildingCode][meetingTime.room] =
                new RoomSchedule(meetingTime.buildingCode, meetingTime.room);
        }
        const roomSchedule = this.roomSchedules[meetingTime.meetingTypeCode]["roomSchedules"][meetingTime.buildingCode][meetingTime.room];
        const beginTime = new TimeHHMM(
            meetingTime.beginTime.hour,
            meetingTime.beginTime.minute
        );
        const endTime = new TimeHHMM(
            meetingTime.endTime.hour,
            meetingTime.endTime.minute
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