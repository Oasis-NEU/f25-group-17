import { bannerURL } from "./constants.js";
import Cache from "./cache.js";

const currentTermsCacheFilepath = "currentTerms.json";

class CourseParser {
    constructor(term) {
        if(!(typeof term === 'string' || term instanceof String && term.length == 6)) {
            throw new Error(`Term ${term} is not valid!`);
        }
        this.term = term;
    }

    async postTerm() {
        const postTermURL = new URL(`${bannerURL}/term/search`);
        postTermURL.searchParams.append("mode", "search");
        let headers = this.cookieString === undefined ?
            {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            } :
            {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Cookie': this.cookieString
            }
        const termResp = await fetch(postTermURL.toString(), {
            method: 'POST',
            credentials: 'include',
            headers: headers,
            body: `term=${this.term}&studyPath=&studyPathText=&startDatepicker=&endDatepicker=`
        });
        if(this.cookieString === undefined) {
            let setCookie = termResp.headers.getSetCookie();
            let cookieString = setCookie.reduce((ckstr, cookie) => ckstr + cookie.split(" ")[0] + " ", "").slice(0, -1);
            this.cookieString = cookieString;
        }
        const termJson = await termResp.json();
        if(!termResp.ok || !termJson.fwdURL) {
            throw new Error("Failed to declare term: " + JSON.stringify(termJson));
        }
        if(typeof termJson.regAllowed == "boolean" && !termJson.regAllowed) {
            throw new Error("Failed to declare term: " + JSON.stringify(termJson));
        }
    }

    async getCourses(pageOffset, pageMaxSize) {
        const coursesResp = await fetch(`${bannerURL}/searchResults/searchResults?txt_subject=&txt_courseNumber=&txt_term=${this.term}&startDatepicker=&endDatepicker=&pageOffset=${pageOffset}&pageMaxSize=${pageMaxSize}&sortColumn=courseReferenceNumber&sortDirection=asc`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Cookie': this.cookieString
            }
        });
        const searchJson = await coursesResp.json();
        if(!Array.isArray(searchJson.data)) {
            throw new Error("Failed to get courses")
        }
        // let result = searchJson.data.map(course => {
        //     return {CRN: course.courseReferenceNumber, FMT: course.meetingsFaculty.map(mf => mf.meetingTime)}
        // });
        let result = searchJson.data.map(course => course);
        return result;
    }
}

let instance = new CourseParser("202610");
await instance.postTerm();

let result = [];

async function getCRNS(pageStart, pageEnd, pageSize, result, done = false) {
    let offset = (pageStart - 1) * pageSize;
    while(!done) {
        console.log(`Getting CRNs on page ${offset / pageSize + 1} with page size ${pageSize}, current result length is ${result.length}, latest result is ${result[result.length - 1]}`)
        let queryResult = await instance.getCourses(offset, pageSize);
        if(queryResult.length == 0) {
            console.log(`Finished fetching CRNs! Current result length is ${result.length}`);
            done = true;
        } else {
            console.log(`Result for page ${offset / pageSize}: ${queryResult}\n`)
            result.push(...queryResult);
            // console.log(`pending result: ${result}`)
            offset += pageSize;
            if(pageEnd != -1 && offset / pageSize == pageEnd) {
                console.log(`Finished fetching CRNs! Current result length is ${result.length}`);
                done = true;
            }
        }
    }
}

let totalCourseRequests = 10000; // number of total courses to get from
let pageSize = 25; // number of courses per page (per http get request)
let pagesPerGetCRNRequest = 10; // number of requests per single parallel run
let promises = [];
for(let i = 0; i < totalCourseRequests / pageSize / pagesPerGetCRNRequest; i++) {
    // console.log([i * pageRange + 1, (i + 1) * pageRange])
    // finishedArr.push(false)
    promises.push(getCRNS(i * pagesPerGetCRNRequest + 1, (i + 1) * pagesPerGetCRNRequest, pageSize, result));
}
await Promise.all(promises);
// let cache = new Cache("coursesmeeting.json");
let cache = new Cache("courses.json");
console.log(result);
cache.update(result)

function generateInstances(terms) {
    if(!Array.isArray(terms)) {
        throw new Error("Could not generate terms from terms because it is not an array.");
    }
    let instances = [];
    for(let term in terms) {
        
    }
}


export default generateInstances;