import termParser from "./parser/termParser.js";
import generateCourseParsers from "./parser/courseParser.js"
import generateTermSchedules from "./schedule/termSchedule.js";
import BostonSchedule from "./schedule/bostonSchedule.js";

async function updateCourseCache({ allowRawCacheUse = true, updateRawCache = true } = {}) {
    const promises = [];
    const currentCourseParsers = await termParser.getCurrentTerms()
        .then(currentTerms => currentTerms.map(term => term.code))
        .then(currentTermCodes => generateCourseParsers(currentTermCodes));
    currentCourseParsers.forEach(courseParser => {
        promises.push(courseParser.updateCourseMeetingTimes(
            { allowCacheUse: allowRawCacheUse, updateRawCache: updateRawCache }
        ));
    });
    return Promise.all(promises).then(() => currentCourseParsers);
}

async function updateTermScheduleCache() {
    const currentTermSchedules = await termParser.getCurrentTerms()
        .then(currentTerms => currentTerms.map(term => term.code))
        .then(currentTermCodes => generateTermSchedules(currentTermCodes));
    currentTermSchedules.forEach(termSchedule => {
        termSchedule.loadRoomSchedules();
        termSchedule.updateCache();
    });
    return currentTermSchedules;
}

async function updateBostonScheduleCache() {
    const bostonSchedule = await termParser.getCurrentTerms()
        .then(currentTerms => currentTerms.map(term => term.code))
        .then(currentTermCodes => new BostonSchedule(currentTermCodes));
    bostonSchedule.loadTermSchedules();
}

async function getCourseMeetingTimes() {
    const promises = [];
    const courseMeetingTimes = [];
    currentCourseParsers.forEach(courseParser => promises.push(
        courseParser.getCourseMeetingTimes().then(courseMeetingTime => courseMeetingTimes.push(courseMeetingTime))
    ));
    await Promise.all(promises);
    return courseMeetingTimes;
}

const startTime = Date.now();
await updateCourseCache();
await updateTermScheduleCache();
await updateBostonScheduleCache();

const endTime = Date.now();
console.log(`Main finished in ${(endTime - startTime) / 1000} seconds.`);


// console.log(await updateCourseCache());
// console.log(await updateScheduleCache());

// console.log(await getCourseMeetingTimes());
// console.log(currentCourseParsers.map(courseParser => courseParser.term))

// may export later if it makes sense to