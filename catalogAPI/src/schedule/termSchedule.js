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
            this.roomSchedules[meetingTypeCode]["outerStartDate"] = {year: null, month: null, day: null};
            this.roomSchedules[meetingTypeCode]["outerEndDate"] = {year: null, month: null, day: null};
            this.roomSchedules[meetingTypeCode]["innerStartDate"] = {year: null, month: null, day: null};
            this.roomSchedules[meetingTypeCode]["innerEndDate"] = {year: null, month: null, day: null};
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

        const meetingTypeOuterStartDate = this.roomSchedules[meetingTime.meetingTypeCode]["outerStartDate"];
        const meetingTypeOuterEndDate = this.roomSchedules[meetingTime.meetingTypeCode]["outerEndDate"];
        const meetingTypeInnerStartDate = this.roomSchedules[meetingTime.meetingTypeCode]["innerStartDate"];
        const meetingTypeInnerEndDate = this.roomSchedules[meetingTime.meetingTypeCode]["innerEndDate"];
        const meetingStartDate = meetingTime.startDate;
        const meetingEndDate = meetingTime.endDate;
        // TODO/warning: this takes the extreme ends of the terms and defines it for the meetingType rather than for each day specifically
        if(
            !meetingTypeOuterStartDate.year || !meetingTypeOuterStartDate.month || !meetingTypeOuterStartDate.day ||
            (meetingStartDate.year < meetingTypeOuterStartDate.year) ||
            (meetingStartDate.year == meetingTypeOuterStartDate.year && meetingStartDate.month < meetingTypeOuterStartDate.month) ||
            (meetingStartDate.year == meetingTypeOuterStartDate.year && meetingStartDate.month == meetingTypeOuterStartDate.month && meetingStartDate.day < meetingTypeOuterStartDate.day)
        ) {
            meetingTypeOuterStartDate.year = meetingStartDate.year;
            meetingTypeOuterStartDate.month = meetingStartDate.month;
            meetingTypeOuterStartDate.day = meetingStartDate.day;
        }
        if(
            !meetingTypeOuterEndDate.year || !meetingTypeOuterEndDate.month || !meetingTypeOuterEndDate.day ||
            (meetingEndDate.year > meetingTypeOuterEndDate.year) ||
            (meetingEndDate.year == meetingTypeOuterEndDate.year && meetingEndDate.month > meetingTypeOuterEndDate.month) ||
            (meetingEndDate.year == meetingTypeOuterEndDate.year && meetingEndDate.month == meetingTypeOuterEndDate.month && meetingEndDate.day > meetingTypeOuterEndDate.day)
        ) {
            meetingTypeOuterEndDate.year = meetingEndDate.year;
            meetingTypeOuterEndDate.month = meetingEndDate.month;
            meetingTypeOuterEndDate.day = meetingEndDate.day;
        }
        if(
            !meetingTypeInnerStartDate.year || !meetingTypeInnerStartDate.month || !meetingTypeInnerStartDate.day ||
            (meetingStartDate.year > meetingTypeInnerStartDate.year) ||
            (meetingStartDate.year == meetingTypeInnerStartDate.year && meetingStartDate.month > meetingTypeInnerStartDate.month) ||
            (meetingStartDate.year == meetingTypeInnerStartDate.year && meetingStartDate.month == meetingTypeInnerStartDate.month && meetingStartDate.day > meetingTypeInnerStartDate.day)
        ) {
            meetingTypeInnerStartDate.year = meetingStartDate.year;
            meetingTypeInnerStartDate.month = meetingStartDate.month;
            meetingTypeInnerStartDate.day = meetingStartDate.day;
        }
        if(
            !meetingTypeInnerEndDate.year || !meetingTypeInnerEndDate.month || !meetingTypeInnerEndDate.day ||
            (meetingEndDate.year < meetingTypeInnerEndDate.year) ||
            (meetingEndDate.year == meetingTypeInnerEndDate.year && meetingEndDate.month < meetingTypeInnerEndDate.month) ||
            (meetingEndDate.year == meetingTypeInnerEndDate.year && meetingEndDate.month == meetingTypeInnerEndDate.month && meetingEndDate.day < meetingTypeInnerEndDate.day)
        ) {
            meetingTypeInnerEndDate.year = meetingEndDate.year;
            meetingTypeInnerEndDate.month = meetingEndDate.month;
            meetingTypeInnerEndDate.day = meetingEndDate.day;
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