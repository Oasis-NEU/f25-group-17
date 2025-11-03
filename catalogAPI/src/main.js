import termParser from "./termParser.js";
import generateCourseParsers from "./courseParser.js"

const currentCourseParsers = await termParser.getCurrentTerms()
    .then(currentTerms => currentTerms.map(term => term.code))
    .then(currentTermCodes => generateCourseParsers(currentTermCodes));

async function updateCache() {
    currentCourseParsers.forEach(courseParser => (courseParser.updateCourseMeetingTimes()));
}

async function getCourseMeetingTimes() {
    return currentCourseParsers.forEach(courseParser => courseParser.getCourseMeetingTimes());
}

updateCache();
console.log(getCourseMeetingTimes());

export default {updateCache: updateCache, getCourseMeetingTimes: getCourseMeetingTimes};