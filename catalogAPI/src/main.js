import termParser from "./parser/termParser.js";
import generateCourseParsers from "./parser/courseParser.js"
import generateTermSchedules from "./schedule/termSchedule.js";

const currentCourseParsers = await termParser.getCurrentTerms()
    .then(currentTerms => currentTerms.map(term => term.code))
    .then(currentTermCodes => generateCourseParsers(currentTermCodes));
const currentTermSchedules = await termParser.getCurrentTerms()
    .then(currentTerms => currentTerms.map(term => term.code))
    .then(currentTermCodes => generateTermSchedules(currentTermCodes));

async function updateCache() {
    currentCourseParsers.forEach(courseParser => { courseParser.updateCourseMeetingTimes(); });
    currentTermSchedules.forEach(termSchedule => {
        termSchedule.loadRoomSchedules();
        termSchedule.updateCache();
    });
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

await updateCache();
// console.log(await getCourseMeetingTimes());
// console.log(currentCourseParsers.map(courseParser => courseParser.term))

export default {updateCache: updateCache, getCourseMeetingTimes: getCourseMeetingTimes};