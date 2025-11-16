import Cache from "../cache.js";
import RoomSchedule from "./roomSchedule.js";
import TimeBoundaries from "./timeBoundaries.js";
import TimeHHMM from "./timeHHMM.js";
import { getBuildingsMap } from "../constants.js";
import { assert } from "console";

class BostonSchedule {
    constructor(termCodes) {
        this.cacheTermSchedules = [];
        termCodes.forEach(termCode => {
            this.cacheTermSchedules.push(
                new Cache(`${termCode}/roomSchedules.json`)
            );
        });
        this.termSchedules = [];
        this.bostonSchedules = [];
        this.cacheBostonSchedules = [];
        this.dateRanges = [];
    }

    loadTermSchedules() {
        this.cacheTermSchedules.forEach(cache => {
            this.termSchedules.push(cache.read());
        });
        this.#findDateRangesFromTermSchedules();
        // let count = 0;
        this.dateRanges.forEach((dateRange, i) => {
            this.bostonSchedules.push({});
            const bostonSchedule = this.bostonSchedules[i];
            const dateBoundaries = [];
            dateRange.indices.forEach(index => {
                const termSchedule = this.termSchedules[index];
                Object.keys(termSchedule).forEach(dateKey => {
                    const [startDateStr, endDateStr] = dateKey.split("-");
                    if(!endDateStr) return;
                    const exclusiveEndDate = new Date(
                        parseInt(endDateStr.slice(0,4)),
                        parseInt(endDateStr.slice(4,6)) - 1,
                        parseInt(endDateStr.slice(6,8)) + 1);
                    const exclusiveEndDateStr =
                        `${exclusiveEndDate.getFullYear()}`+
                        `${String(exclusiveEndDate.getMonth() + 1).padStart(2, '0')}`+
                        `${String(exclusiveEndDate.getDate()).padStart(2, '0')}`;
                    if(!dateBoundaries.includes(startDateStr)) dateBoundaries.push(startDateStr);
                    if(!dateBoundaries.includes(exclusiveEndDateStr)) dateBoundaries.push(exclusiveEndDateStr);
                });
            });
            dateBoundaries.sort();

            const dateRangeSchedules = [];
            for(let i = 0; i < dateBoundaries.length - 1; i++) {
                dateRangeSchedules.push({});
                Object.keys(getBuildingsMap()).forEach(buildingCode => {
                    dateRangeSchedules[i][buildingCode] = {};
                });
            }

            dateRange.indices.forEach(index => {
                const termSchedule = this.termSchedules[index];
                Object.keys(termSchedule).forEach(dateKey => {
                    const [startDateStr, endDateStr] = dateKey.split("-");
                    if(!endDateStr) return;
                    const startIndex = dateBoundaries.indexOf(startDateStr);
                    const exclusiveEndDate = new Date(
                        parseInt(endDateStr.slice(0,4)),
                        parseInt(endDateStr.slice(4,6)) - 1,
                        parseInt(endDateStr.slice(6,8)) + 1);
                    const exclusiveEndDateStr =
                        `${exclusiveEndDate.getFullYear()}`+
                        `${String(exclusiveEndDate.getMonth() + 1).padStart(2, '0')}`+
                        `${String(exclusiveEndDate.getDate()).padStart(2, '0')}`;
                    const endIndex = dateBoundaries.indexOf(exclusiveEndDateStr);
                    for(let i = startIndex; i < endIndex; i++) {
                        Object.keys(termSchedule[dateKey]).forEach(buildingCode => {
                            Object.keys(termSchedule[dateKey][buildingCode]).forEach(roomNumber => {
                                if(!dateRangeSchedules[i][buildingCode][roomNumber]) {
                                    dateRangeSchedules[i][buildingCode][roomNumber] =
                                        new RoomSchedule(buildingCode, roomNumber);
                                }
                                const roomSchedule = dateRangeSchedules[i][buildingCode][roomNumber];
                                Object.setPrototypeOf(roomSchedule, RoomSchedule.prototype);
                                Object.setPrototypeOf(termSchedule[dateKey][buildingCode][roomNumber], RoomSchedule.prototype);
                                Object.keys(roomSchedule.timeBoundaries).forEach(day => {
                                    const timeBoundaries = roomSchedule.timeBoundaries[day];
                                    Object.setPrototypeOf(timeBoundaries, TimeBoundaries.prototype);
                                    timeBoundaries.boundaries.forEach(time => {
                                        Object.setPrototypeOf(time, TimeHHMM.prototype);
                                    });
                                });
                                Object.keys(termSchedule[dateKey][buildingCode][roomNumber].timeBoundaries).forEach(day => {
                                    const timeBoundaries = termSchedule[dateKey][buildingCode][roomNumber].timeBoundaries[day];
                                    Object.setPrototypeOf(timeBoundaries, TimeBoundaries.prototype);
                                    timeBoundaries.boundaries.forEach(time => {
                                        Object.setPrototypeOf(time, TimeHHMM.prototype);
                                    });
                                });
                                // count++;
                                // console.log(count);
                                roomSchedule.merge(termSchedule[dateKey][buildingCode][roomNumber]);
                            });
                        });
                    }
                });
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
                bostonSchedule[`${dateBoundaries[i]}-${inclusiveEndDateStr}`] = dateRangeSchedules[i];
            }
            // need to do single days to update date range
            dateRange.indices.forEach(index => {
                const termSchedule = this.termSchedules[index];
                Object.keys(termSchedule).forEach(dateKey => {
                    const [startDateStr, endDateStr] = dateKey.split("-");
                    if(endDateStr) return;
                    const dateStr = startDateStr;
                    if(bostonSchedule[dateStr]) {
                        const existingSchedule = bostonSchedule[dateStr];
                        Object.keys(termSchedule[dateKey]).forEach(buildingCode => {
                            Object.keys(termSchedule[dateKey][buildingCode]).forEach(roomNumber => {
                                if(!existingSchedule[buildingCode]) {
                                    existingSchedule[buildingCode] = {};
                                }
                                if(!existingSchedule[buildingCode][roomNumber]) {
                                    existingSchedule[buildingCode][roomNumber] =
                                        new RoomSchedule(buildingCode, roomNumber);
                                }
                                const roomSchedule = existingSchedule[buildingCode][roomNumber];
                                // Object.setPrototypeOf(roomSchedule, RoomSchedule.prototype);
                                // Object.keys(roomSchedule.timeBoundaries).forEach(day => {
                                //     const timeBoundaries = roomSchedule.timeBoundaries[day];
                                //     Object.setPrototypeOf(timeBoundaries, TimeBoundaries.prototype);
                                // });
                                Object.keys(termSchedule[dateKey][buildingCode][roomNumber].timeBoundaries).forEach(day => {
                                    const timeBoundaries = termSchedule[dateKey][buildingCode][roomNumber].timeBoundaries[day];
                                    Object.setPrototypeOf(timeBoundaries, TimeBoundaries.prototype);
                                    timeBoundaries.boundaries.forEach(time => {
                                        Object.setPrototypeOf(time, TimeHHMM.prototype);
                                    });
                                });
                                // count++;
                                // console.log(count);
                                roomSchedule.merge(termSchedule[dateKey][buildingCode][roomNumber]);
                            });
                        });
                    }
                    if(dateStr < dateBoundaries[0] || dateStr > dateBoundaries[dateBoundaries.length - 1]) {
                        bostonSchedule[dateStr] = termSchedule[dateKey];
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
                        const overlappedSchedule = bostonSchedule[`${dateBoundaries[i - 1]}-${inclusiveEndDateStr}`];
                        bostonSchedule[dateStr] = {};
                        Object.keys(termSchedule[dateKey]).forEach(buildingCode => {
                            Object.keys(termSchedule[dateKey][buildingCode]).forEach(roomNumber => {
                                if(!bostonSchedule[dateStr][buildingCode]) {
                                    bostonSchedule[dateStr][buildingCode] = {};
                                }
                                if(!bostonSchedule[dateStr][buildingCode][roomNumber]) {
                                    bostonSchedule[dateStr][buildingCode][roomNumber] =
                                        new RoomSchedule(buildingCode, roomNumber);
                                }
                                const roomSchedule = bostonSchedule[dateStr][buildingCode][roomNumber];
                                if(overlappedSchedule[buildingCode][roomNumber]) {
                                    roomSchedule.merge(overlappedSchedule[buildingCode][roomNumber]);
                                }
                                // count++;
                                // console.log(count);
                                Object.keys(termSchedule[dateKey][buildingCode][roomNumber].timeBoundaries).forEach(day => {
                                    const timeBoundaries = termSchedule[dateKey][buildingCode][roomNumber].timeBoundaries[day];
                                    Object.setPrototypeOf(timeBoundaries, TimeBoundaries.prototype);
                                    timeBoundaries.boundaries.forEach(time => {
                                        Object.setPrototypeOf(time, TimeHHMM.prototype);
                                    });
                                });
                                roomSchedule.merge(termSchedule[dateKey][buildingCode][roomNumber]);
                            });
                        });
                        return;
                    }
                    assert(false, "Unreachable code reached when loading Boston schedules");
                });
            });
        });
        this.bostonSchedules.forEach((bostonSchedule, i) => {
            this.cacheBostonSchedules[i].update(bostonSchedule);
        });
    }

    #findDateRangesFromTermSchedules() {
        const termDateRanges = [];
        this.termSchedules.forEach((termSchedule, i) => {
            termDateRanges.push({});
            Object.keys(termSchedule).forEach(dateKey => {
                const [startDateStr, endDateStr] = dateKey.split("-");
                if(!termDateRanges[i].start) {
                    termDateRanges[i].start = startDateStr;
                } else if (startDateStr < termDateRanges[i].start) {
                    termDateRanges[i].start = startDateStr;
                }
                if(!endDateStr) {
                    if(!termDateRanges[i].end) {
                        termDateRanges[i].end = startDateStr;
                    } else if(startDateStr > termDateRanges[i].end) {
                        termDateRanges[i].end = startDateStr;
                    }
                } else {
                    if(!termDateRanges[i].end) {
                        termDateRanges[i].end = endDateStr;
                    } else if(endDateStr > termDateRanges[i].end) {
                        termDateRanges[i].end = endDateStr;
                    }
                }
            });
        });
        console.log(termDateRanges);
        termDateRanges.forEach((termDateRange, i) => {
            let added = false;
            this.dateRanges.forEach(dateRange => {
                if(termDateRange.start <= dateRange.end && termDateRange.end >= dateRange.start) {
                    dateRange.indices.push(i);
                    if(termDateRange.start < dateRange.start) {
                        dateRange.start = termDateRange.start;
                    }
                    if(termDateRange.end > dateRange.end) {
                        dateRange.end = termDateRange.end;
                    }
                    added = true;
                }
            });
            if(!added) {
                this.dateRanges.push({
                    start: termDateRange.start,
                    end: termDateRange.end,
                    indices: [i]
                });
            }
        });
        console.log(this.dateRanges);
        this.dateRanges.forEach((_, i) => {
            this.cacheBostonSchedules.push(new Cache(`masterSchedules/schedule${i}.json`));
        });
    }

}

export default BostonSchedule;