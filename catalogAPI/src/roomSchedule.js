import { get } from "http";
import Cache from "./cache.js";

// const buildings = getBuil

class RoomSchedule {
    constructor(building) {
        this.building = building;
    }
}

class Building {
    constructor(name, code) {
        this.name = name;
        this.code = code;
    }
}

function getBuildings() {
    const term = "202610";
    const cmtCache = new Cache(`${term}/courseMeetingTimes.json`);
    console.log(cmtCache.read());
}

getBuildings();