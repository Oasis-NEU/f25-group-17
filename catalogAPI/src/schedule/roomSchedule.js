import TimeBoundaries from "./timeBoundaries.js";
import { buildingsMap } from "../constants.js";

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

// let testrs = new RoomSchedule("TEST", "101");
// console.log(testrs.timeBoundaries);
// testrs.timeBoundaries.monday.push(new TimeHHMM(9, 30));
// console.log(testrs.timeBoundaries);

// let tbs = new TimeBoundaries();
// tbs.push(new TimeHHMM(9, 30));
// tbs.push(new TimeHHMM(8, 0));
// tbs.push(new TimeHHMM(12, 15));
// tbs.push(new TimeHHMM(18, 30));
// console.log(tbs);
// console.log(tbs.checkFree(new TimeHHMM(8, 45)));

export default RoomSchedule;