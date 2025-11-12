import termParser from "./parser/termParser.js";
import generateCourseParsers from "./parser/courseParser.js"
import generateTermSchedules from "./schedule/termSchedule.js";

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

async function updateScheduleCache() {
    const currentTermSchedules = await termParser.getCurrentTerms()
        .then(currentTerms => currentTerms.map(term => term.code))
        .then(currentTermCodes => generateTermSchedules(currentTermCodes));
    currentTermSchedules.forEach(termSchedule => {
        termSchedule.loadRoomSchedules();
        termSchedule.updateCache();
    });
    return currentTermSchedules;
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

await updateCourseCache();
await updateScheduleCache();

// console.log(await updateCourseCache());
// console.log(await updateScheduleCache());

// console.log(await getCourseMeetingTimes());
// console.log(currentCourseParsers.map(courseParser => courseParser.term))

// may export later if it makes sense to