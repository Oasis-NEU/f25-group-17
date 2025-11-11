import Cache from "./cache.js";

export const bannerURL = "https://nubanner.neu.edu/StudentRegistrationSsb/ssb";
export const buildingsMap = getBuildingsMap();

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