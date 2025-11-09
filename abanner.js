import Cache from "./catalogAPI/src/cache.js";

async function searchClasses(termCode, subjectFilter = "", offset = 1, max = 20) {
  const base = "https://nubanner.neu.edu/StudentRegistrationSsb/ssb";

  // 1) Declare term
  const termResp = await fetch(`${base}/term/search?mode=search`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Cookie': 'JSESSIONID=3034F280510B3C8CEEF4B9A5A08C5D9F; nubanner-cookie=2636063131.36895.0000;'
    },
    body: `term=${termCode}&studyPath=&studyPathText=&startDatepicker=&endDatepicker=`
  });
  const termJson = await termResp.json();
  console.log(termJson)
  if (!termResp.ok || !termJson.fwdURL) {
    throw new Error("Failed to declare term: " + JSON.stringify(termJson));
  }

  // 2) Get subject list
  const subjUrl = new URL(`${base}/classSearch/get_subject`);
  subjUrl.searchParams.set('term', termCode);
  subjUrl.searchParams.set('offset', offset);
  subjUrl.searchParams.set('max', max);
  if (subjectFilter) subjUrl.searchParams.set('searchTerm', subjectFilter);

  const subjResp = await fetch(subjUrl.toString(), {
    method: 'GET',
    credentials: 'include'
  });
  const subjList = await subjResp.json();

  // 3) Optionally pick a subject, then search classes
  // Example: pick first subject code
  if (subjList.length === 0) {
    return { subjects: subjList, classes: [] };
  }
  const subj = "CS";

  // 4) Search results
  const searchUrl = new URL(`${base}/searchResults/searchResults`);
  searchUrl.searchParams.set('txt_term', termCode);
  searchUrl.searchParams.set('txt_subject', "CS");
//   searchUrl.searchParams.set('offset', offset);
//   searchUrl.searchParams.set('max', max);
  // possibly other filters: courseNbr, scheduleType, etc.
//   console.log(searchUrl.toString());

  const searchResp = await fetch(`${base}/searchResults/searchResults?txt_subject=&txt_courseNumber=&txt_term=${termCode}&startDatepicker=&endDatepicker=&pageOffset=0&pageMaxSize=1&sortColumn=subjectDescription&sortDirection=asc`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Cookie': 'JSESSIONID=3034F280510B3C8CEEF4B9A5A08C5D9F; nubanner-cookie=2636063131.36895.0000;'
    }
  });
  const searchJson = await searchResp.json();
  // console.log(searchResp.headers)
  // console.log(searchJson)

  const instrResp = await fetch(`${base}/searchResults/getFacultyMeetingTimes?term=${termCode}&courseReferenceNumber=34034`)
  let fmtjson = await instrResp.json()
  console.log(fmtjson.fmt.map(fmt => fmt))

  return {
    subjects: subjList,
    classes: searchJson
  };
}

// Usage:
// searchClasses("202630", "")
//   .then(res => {
//     // console.log("Subjects:", res.subjects);
//     // console.log("Classes:", res.classes.data[0]);
//     // console.log("Classes:", res.classes);
//   })
//   .catch(err => {
//     console.error("Error:", err);
//   });


async function getFaculty(crn) {
  const bannerURL = "https://nubanner.neu.edu/StudentRegistrationSsb/ssb";
  const currentTermCode = 202630;
  const instrResp = await fetch(`${bannerURL}/searchResults/getFacultyMeetingTimes?term=${currentTermCode}&courseReferenceNumber=${crn}`)
  return await instrResp.json();
}

const c = new Cache("faculty.json");
const cmtCache = new Cache("read.json");

const cmts = [];
let wait = 0;
const courses = cmtCache.read();
for(let i = 0; i < courses.length; i++) {
  const course = courses[i];
  console.log(course.CRN);
  const faculty = await getFaculty(course.CRN);
  wait += 100;
  cmts.push(faculty);
}
// cmtCache.read().forEach(course => {
//   console.log(course.CRN);
//   const faculty = setTimeout(() => getFaculty(course.CRN), wait);
//   wait += 100;
//   cmts.push(faculty);
// })
await Promise.all(cmts);

console.log(cmts[0].fmt[0].faculty)
c.update(cmts)