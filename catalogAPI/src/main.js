import termParser from "./termParser.js";
import generateCourseParsers from "./courseParser.js"

const updateTermCache = false;
if(updateTermCache) {
    await termParser.updateCache();
}
// console.log(await termParser.getCurrentTerms());
const currentTerms = await termParser.getCurrentTerms();
const currentTermCodes = currentTerms.map(term => term.code);
const courseParsers = generateCourseParsers(currentTermCodes);
courseParsers.forEach(courseParser => courseParser.updateCourseMeetingTimes());