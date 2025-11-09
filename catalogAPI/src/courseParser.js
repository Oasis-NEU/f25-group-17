import { bannerURL } from "./constants.js";
import Cache from "./cache.js";

const coursesRawCacheFilepath = "coursesRaw.json";
const courseMeetingTimesCacheFilepath = "courseMeetingTimes.json";

class CourseParser {
    verbosity = 0;

    constructor(term) {
        if(!(typeof term === 'string' || term instanceof String && term.length == 6)) {
            throw new Error(`Term ${term} is not valid!`);
        }
        this.term = term;
        this.cacheRawCourses = new Cache(`${term}/${coursesRawCacheFilepath}`);
        this.cacheCourseMeetingTimes = new Cache(`${term}/${courseMeetingTimesCacheFilepath}`);
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
            };
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

    async searchCourses(pageOffset, pageMaxSize) {
        const searchURL = new URL(`${bannerURL}/searchResults/searchResults`);
        // searchURL.searchParams.append("txt_subject", "")
        searchURL.searchParams.append("txt_term", this.term);
        // searchURL.searchParams.append("startDatepicker", "");
        // searchURL.searchParams.append("endDatepicker", "");
        searchURL.searchParams.append("pageOffset", pageOffset);
        searchURL.searchParams.append("pageMaxSize", pageMaxSize);
        searchURL.searchParams.append("sortColumn", "courseReferenceNumber");
        searchURL.searchParams.append("sortDirection", "asc");
        const coursesResp = await fetch(searchURL.toString(), {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Cookie': this.cookieString
            }
        });
        const searchJson = await coursesResp.json();
        if(!Array.isArray(searchJson.data)) {
            throw new Error("Failed to get courses");
        }
        const result = searchJson.data;
        return result;
    }

    async searchCoursePagesSequential(pageStart, pageEnd, pageSize, result) {
        if(this.verbosity >= 2) console.log(`Searching course pages ${pageStart} to ${pageEnd} with page size ${pageSize} for term ${this.term}...`);

        let done = false;
        let offset = (pageStart - 1) * pageSize;

        while(!done) {
            if(this.verbosity >= 4) console.log(`Getting courses on page ${offset / pageSize + 1} with page size ${pageSize}, current result length is ${result.length}, latest result is ${result[result.length - 1]}`);
            const queryResult = await this.searchCourses(offset, pageSize);
            if(queryResult.length == 0) {
                if(this.verbosity >= 1) console.log(`Finished fetching courses from pages ${pageStart} to ${pageEnd} for term ${this.term}! Current result length is ${result.length}`);
                done = true;
                return true;
            } else {
                if(this.verbosity >= 3) console.log(`Result for page ${offset / pageSize}: ${queryResult}\n`);
                result.push(...queryResult);
                offset += pageSize;
                if(pageEnd != -1 && offset / pageSize == pageEnd) {
                    if(this.verbosity >= 1) console.log(`Finished fetching courses from pages ${pageStart} to ${pageEnd} for term ${this.term}! Current result length is ${result.length}`);
                    done = true;
                }
            }
        }
        return false;
    }

    async searchCoursesPagesParallel(maxTotalCourseRequests, pageSize, pagesPerSequentialRequest) {
        const result = [];
        const promises = [];
        const sleepBetweenParallelMs = 75;
        let emptyResultFound = false;
        let extraRequests = 0;
        for(let i = 0; i < maxTotalCourseRequests / pageSize / pagesPerSequentialRequest; i++) {
            promises.push(this.searchCoursePagesSequential(
                i * pagesPerSequentialRequest + 1,
                (i + 1) * pagesPerSequentialRequest,
                pageSize,
                result
            ));

            promises[promises.length - 1].then(isEmpty => {
                if(isEmpty) {
                    if(emptyResultFound) {
                        extraRequests++;
                    } else {
                        emptyResultFound = true;
                    }
                }
            });
            if(emptyResultFound) break;

            // Allow empty results check to finish and prevent spam requests by sleeping
            await new Promise(resolve => setTimeout(resolve, sleepBetweenParallelMs));
        }
        await Promise.all(promises);
        console.log(`Finished fetching courses for term ${this.term} with ${extraRequests} extra empty requests made.`);
        return result;
    }

    async fetchRawCourses({
        totalCourseRequests = 100000,
        pageSize = 20,
        pagesPerSequentialRequest = 5} = {}
    ) {
        if(this.cookieString === undefined) {
            await this.postTerm();
        }
        return await this.searchCoursesPagesParallel(
            totalCourseRequests,
            pageSize,
            pagesPerSequentialRequest
        );
    }

    async updateRawCache() {
        console.log(`Updating raw courses cache for term ${this.term}...`);
        this.cacheRawCourses.update(await this.fetchRawCourses());
        this.cacheRawCourses.update(this.cacheRawCourses.read().sort((a, b) => a.courseReferenceNumber - b.courseReferenceNumber));
    }

    async getRawCourses(updateCache = true) {
        // May cause future errors since not sure if cache loads properly (sync/async wise)
        if(this.cacheRawCourses.isEmpty()) {
            if(!updateCache) {
                return await this.fetchRawCourses();
            }
            await this.updateRawCache();
        }
        return this.cacheRawCourses.read();
    }

    async fetchCourseMeetingTimes({ allowCacheUse = true, updateRawCache = true } = {}) {
        const rawCourseData = await (allowCacheUse ? this.getRawCourses(updateRawCache) : this.fetchRawCourses());
        const bostonCourseData = rawCourseData.filter(course => course.campusDescription == "Boston");
        bostonCourseData.forEach(course => course.meetingsFaculty = course.meetingsFaculty.filter(
            fmt => fmt.meetingTime.building != null && fmt.meetingTime.beginTime != null
                && fmt.meetingTime.building != "BOS" && fmt.meetingTime.building != "VTL"
        ));
        const filteredCourseData = bostonCourseData.filter(course => course.meetingsFaculty.length > 0);
        filteredCourseData.forEach(course => {
            course.CRN = course.courseReferenceNumber;
            course.courseName = course.courseTitle;
            course.courseCode = course.subjectCourse;
            const courseNumber = course.courseNumber;
            const subject = course.subject;
            delete course.id;
            delete course.term;
            delete course.termDesc;
            delete course.courseReferenceNumber;
            delete course.partOfTerm;
            delete course.courseNumber;
            delete course.subject;
            delete course.subjectDescription;
            delete course.sequenceNumber;
            delete course.campusDescription;
            delete course.scheduleTypeDescription;
            delete course.courseTitle;
            delete course.creditHours;
            delete course.maximumEnrollment;
            delete course.enrollment;
            delete course.seatsAvailable;
            delete course.waitCapacity;
            delete course.waitCount;
            delete course.waitAvailable;
            delete course.crossList;
            delete course.crossListCapacity;
            delete course.crossListCount;
            delete course.crossListAvailable;
            delete course.creditHourHigh;
            delete course.creditHourLow;
            delete course.creditHourIndicator;
            delete course.openSection;
            delete course.linkIdentifier;
            delete course.isSectionLinked;
            delete course.subjectCourse;
            delete course.faculty;
            delete course.reservedSeatSummary;
            delete course.sectionAttributes;
            delete course.instructionalMethod;
            delete course.instructionalMethodDescription;
            course.subject = subject;
            course.courseNumber = courseNumber;
        });
        filteredCourseData.forEach(course => {
            course.meetingTimes = course.meetingsFaculty.map(meeting => meeting.meetingTime);
            delete course.meetingsFaculty;
            course.meetingTimes.forEach(meetingTime => {
                const sunday = meetingTime.sunday;
                const monday = meetingTime.monday;
                const tuesday = meetingTime.tuesday;
                const wednesday = meetingTime.wednesday;
                const thursday = meetingTime.thursday;
                const friday = meetingTime.friday;
                const saturday = meetingTime.saturday;

                const startDateObj = new Date(meetingTime.startDate);
                const endDateObj = new Date(meetingTime.endDate);
                const startDate = {
                    year: startDateObj.getFullYear(),
                    month: startDateObj.getMonth() + 1,
                    day: startDateObj.getDate()
                };
                const endDate = {
                    year: endDateObj.getFullYear(),
                    month: endDateObj.getMonth() + 1,
                    day: endDateObj.getDate()
                };
                const beginTime = {
                    hour: meetingTime.beginTime.slice(0, 2),
                    minute: meetingTime.beginTime.slice(2, 4)
                };
                const endTime = {
                    hour: meetingTime.endTime.slice(0, 2),
                    minute: meetingTime.endTime.slice(2, 4)
                };
                if(beginTime == null || endTime == null) {
                    console.log(course.CRN);
                }
                const building = meetingTime.buildingDescription;
                const buildingCode = meetingTime.building;
                const room = meetingTime.room;

                delete meetingTime.beginTime;
                delete meetingTime.building;
                delete meetingTime.buildingDescription;
                delete meetingTime.campus;
                delete meetingTime.campusDescription;
                delete meetingTime.category;
                delete meetingTime.class;
                delete meetingTime.courseReferenceNumber;
                delete meetingTime.creditHourSession;
                delete meetingTime.endDate;
                delete meetingTime.endTime;
                delete meetingTime.friday;
                delete meetingTime.hoursWeek;
                delete meetingTime.meetingScheduleType;
                delete meetingTime.meetingType;
                delete meetingTime.meetingTypeDescription;
                delete meetingTime.monday;
                delete meetingTime.room;
                delete meetingTime.saturday;
                delete meetingTime.startDate;
                delete meetingTime.sunday;
                delete meetingTime.term;
                delete meetingTime.thursday;
                delete meetingTime.tuesday;
                delete meetingTime.wednesday;

                meetingTime.beginTime = beginTime;
                meetingTime.endTime = endTime;
                meetingTime.startDate = startDate;
                meetingTime.endDate = endDate;
                meetingTime.building = building;
                meetingTime.buildingCode = buildingCode;
                meetingTime.room = room;

                meetingTime.sunday = sunday;
                meetingTime.monday = monday;
                meetingTime.tuesday = tuesday;
                meetingTime.wednesday = wednesday;
                meetingTime.thursday = thursday;
                meetingTime.friday = friday;
                meetingTime.saturday = saturday;
            });
        });
        return filteredCourseData;
    }

    async updateCourseMeetingTimes() {
        console.log(`Updating course meeting times cache for term ${this.term}...`);
        this.cacheCourseMeetingTimes.update(await this.fetchCourseMeetingTimes());
    }

    async getCourseMeetingTimes(updateCache = true) {
        if(this.cacheCourseMeetingTimes.isEmpty()) {
            if(!updateCache) {
                return await this.fetchCourseMeetingTimes();
            }
            await this.updateCourseMeetingTimes();
        }
        return this.cacheCourseMeetingTimes.read();
    }
}

function generateInstances(terms) {
    if(!Array.isArray(terms)) {
        throw new Error("Could not generate terms from terms because it is not an array.");
    }
    const instances = [];
    terms.forEach(term => instances.push(new CourseParser(term)));
    return instances;
}

export default generateInstances;