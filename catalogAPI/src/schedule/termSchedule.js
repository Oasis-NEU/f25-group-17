import Cache from "../cache.js";
import RoomSchedule from "./roomSchedule.js";
import TimeHHMM from "./timeHHMM.js";
import { getBuildingsMap, getMeetingTypesMap } from "../constants.js";
import { assert } from "console";

class TermSchedule {
    constructor(termCode) {
        this.termCode = termCode;
        this.rawRoomSchedules = {};
        this.roomSchedules = {};
        this.cacheCourseMeetingTimes = new Cache(`${termCode}/courseMeetingTimes.json`);
        this.cacheRawSchedule = new Cache(`${termCode}/rawRoomSchedules.json`);
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
            course.meetingTimes.forEach(meetingTime => {
                // this.#updateRoomScheduleWithMeetingTime(course, meetingTime);
                this.#updateRawRoomScheduleWithMeetingTime(course, meetingTime);
            });
        });
        this.#generateRoomSchedule();
    }

    updateCache() {
        console.log(`Updating room schedule cache for term ${this.termCode}...`)
        this.cacheSchedule.update(this.roomSchedules);
        this.cacheRawSchedule.update(this.rawRoomSchedules);
    }

    updateFromCache() {
        if(this.cacheSchedule.isEmpty()) {
            throw new Error("Cannot update TermSchedule from cache because cache is empty.");
        }
        this.roomSchedules = this.cacheSchedule.read();
    }

    clearRoomSchedules() {
        this.rawRoomSchedules = {};
        this.roomSchedules = {};
        // Object.keys(getMeetingTypesMap()).forEach(meetingTypeCode => {
        //     this.roomSchedules[meetingTypeCode] = {};
        //     this.roomSchedules[meetingTypeCode]["outerStartDate"] = {year: null, month: null, day: null};
        //     this.roomSchedules[meetingTypeCode]["outerEndDate"] = {year: null, month: null, day: null};
        //     this.roomSchedules[meetingTypeCode]["innerStartDate"] = {year: null, month: null, day: null};
        //     this.roomSchedules[meetingTypeCode]["innerEndDate"] = {year: null, month: null, day: null};
        //     this.roomSchedules[meetingTypeCode]["roomSchedules"] = {};
        //     Object.keys(getBuildingsMap()).forEach(buildingCode => {
        //         this.roomSchedules[meetingTypeCode]["roomSchedules"][buildingCode] = {};
        //     });
        // });
    }

    #updateRawRoomScheduleWithMeetingTime(course, meetingTime) {
        if(!meetingTime.buildingCode || !meetingTime.room) {
            console.log(`${course.CRN} has missing meeting time building or room number.`);
            return;
        }
        // if(meetingTime.startDate.year == meetingTime.endDate.year &&
        //    meetingTime.startDate.month == meetingTime.endDate.month &&
        //    meetingTime.startDate.day == meetingTime.endDate.day) {

        // }
        const dateKey = 
            `${meetingTime.startDate.year}`+
            `${String(meetingTime.startDate.month).padStart(2, '0')}`+
            `${String(meetingTime.startDate.day).padStart(2, '0')}-`+
            `${meetingTime.endDate.year}`+
            `${String(meetingTime.endDate.month).padStart(2, '0')}`+
            `${String(meetingTime.endDate.day).padStart(2, '0')}`
        ;
        if(!this.rawRoomSchedules[dateKey]) {
            this.rawRoomSchedules[dateKey] = {};
            Object.keys(getBuildingsMap()).forEach(buildingCode => {
                this.rawRoomSchedules[dateKey][buildingCode] = {};
            });
        }
        if(!this.rawRoomSchedules[dateKey][meetingTime.buildingCode][meetingTime.room]) {
            this.rawRoomSchedules[dateKey][meetingTime.buildingCode][meetingTime.room] =
                new RoomSchedule(meetingTime.buildingCode, meetingTime.room);
        }

        const roomSchedule = this.rawRoomSchedules[dateKey][meetingTime.buildingCode][meetingTime.room];
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

    #generateRoomSchedule() {
        // let count = 0;
        const dateBoundaries = [];
        Object.keys(this.rawRoomSchedules).forEach(dateKey => {
            const [startDateStr, endDateStr] = dateKey.split("-");
            if(startDateStr != endDateStr) {
                if(!dateBoundaries.includes(startDateStr)) dateBoundaries.push(startDateStr);
                const exclusiveEndDate = new Date(
                    parseInt(endDateStr.slice(0, 4)),
                    parseInt(endDateStr.slice(4, 6)) - 1,
                    parseInt(endDateStr.slice(6, 8)) + 1);
                const exclusiveEndDateStr =
                    `${exclusiveEndDate.getFullYear()}`+
                    `${String(exclusiveEndDate.getMonth() + 1).padStart(2, '0')}`+
                    `${String(exclusiveEndDate.getDate()).padStart(2, '0')}`;
                if(!dateBoundaries.includes(exclusiveEndDateStr)) dateBoundaries.push(exclusiveEndDateStr);
            }
        });
        dateBoundaries.sort();

        const dateRangeSchedules = [];
        for(let i = 0; i < dateBoundaries.length - 1; i++) {
            dateRangeSchedules.push({});
            Object.keys(getBuildingsMap()).forEach(buildingCode => {
                dateRangeSchedules[i][buildingCode] = {};
            });
        }
        Object.keys(this.rawRoomSchedules).forEach(dateKey => {
            const [startDateStr, endDateStr] = dateKey.split("-");
            if(startDateStr == endDateStr) return;
            const startIndex = dateBoundaries.indexOf(startDateStr);
            const exclusiveEndDate = new Date(
                parseInt(endDateStr.slice(0, 4)),
                parseInt(endDateStr.slice(4, 6)) - 1,
                parseInt(endDateStr.slice(6, 8)) + 1);
            const exclusiveEndDateStr =
                `${exclusiveEndDate.getFullYear()}`+
                `${String(exclusiveEndDate.getMonth() + 1).padStart(2, '0')}`+
                `${String(exclusiveEndDate.getDate()).padStart(2, '0')}`;
            const endIndex = dateBoundaries.indexOf(exclusiveEndDateStr);
            for(let i = startIndex; i < endIndex; i++) {
                Object.keys(this.rawRoomSchedules[dateKey]).forEach(buildingCode => {
                    Object.keys(this.rawRoomSchedules[dateKey][buildingCode]).forEach(roomNumber => {
                        if(!dateRangeSchedules[i][buildingCode][roomNumber]) {
                            dateRangeSchedules[i][buildingCode][roomNumber] =
                                new RoomSchedule(buildingCode, roomNumber);
                        }
                        // count++;
                        // console.log(count);
                        dateRangeSchedules[i][buildingCode][roomNumber].merge(
                            this.rawRoomSchedules[dateKey][buildingCode][roomNumber]
                        );
                    });
                });
            }
        });
        for(let i = 0; i < dateBoundaries.length - 1; i++) {
            const inclusiveEndDate = new Date(
                parseInt(dateBoundaries[i + 1].slice(0, 4)),
                parseInt(dateBoundaries[i + 1].slice(4, 6)) - 1,
                parseInt(dateBoundaries[i + 1].slice(6, 8)) - 1);
            const inclusiveEndDateStr =
                `${inclusiveEndDate.getFullYear()}`+
                `${String(inclusiveEndDate.getMonth() + 1).padStart(2, '0')}`+
                `${String(inclusiveEndDate.getDate()).padStart(2, '0')}`;
            this.roomSchedules[`${dateBoundaries[i]}-${inclusiveEndDateStr}`] = dateRangeSchedules[i];
        }
        Object.keys(this.rawRoomSchedules).forEach(dateKey => {
            const [startDateStr, endDateStr] = dateKey.split("-");
            if(startDateStr != endDateStr) return;
            const dateStr = startDateStr;
            if(dateStr < dateBoundaries[0] || dateStr > dateBoundaries[dateBoundaries.length - 1]) {
                this.roomSchedules[dateStr] = this.rawRoomSchedules[dateKey];
                return;
            }
            for(let i = 1; i < dateBoundaries.length; i++) {
                if(dateStr >= dateBoundaries[i]) continue;
                const inclusiveEndDate = new Date(
                    parseInt(dateBoundaries[i].slice(0,4)),
                    parseInt(dateBoundaries[i].slice(4,6)) - 1,
                    parseInt(dateBoundaries[i].slice(6,8)) - 1);
                const inclusiveEndDateStr =
                    `${inclusiveEndDate.getFullYear()}`+
                    `${String(inclusiveEndDate.getMonth() + 1).padStart(2, '0')}`+
                    `${String(inclusiveEndDate.getDate()).padStart(2, '0')}`;
                const overlappedSchedule = this.roomSchedules[`${dateBoundaries[i - 1]}-${inclusiveEndDateStr}`]
                this.roomSchedules[dateStr] = {};
                Object.keys(this.rawRoomSchedules[dateKey]).forEach(buildingCode => {
                    Object.keys(this.rawRoomSchedules[dateKey][buildingCode]).forEach(roomNumber => {
                        if(!this.roomSchedules[dateStr][buildingCode]) {
                            this.roomSchedules[dateStr][buildingCode] = {};
                        }
                        if(!this.roomSchedules[dateStr][buildingCode][roomNumber]) {
                            this.roomSchedules[dateStr][buildingCode][roomNumber] =
                                new RoomSchedule(buildingCode, roomNumber);
                        }
                        if(!this.roomSchedules[dateStr][buildingCode][roomNumber]) {
                            this.roomSchedules[dateStr][buildingCode][roomNumber] =
                                new RoomSchedule(buildingCode, roomNumber);
                        }
                        if(overlappedSchedule[buildingCode][roomNumber]) {
                            this.roomSchedules[dateStr][buildingCode][roomNumber].merge(
                                overlappedSchedule[buildingCode][roomNumber]
                            );
                        }
                        this.roomSchedules[dateStr][buildingCode][roomNumber].merge(
                            this.rawRoomSchedules[dateKey][buildingCode][roomNumber]
                        );
                        // count++;
                        // console.log(count);
                    });
                });
                return;
            }
            assert(false, "Unreachable code reached in #generateRoomSchedule");
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